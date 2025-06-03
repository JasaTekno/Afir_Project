<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\ShipmentCostTotal;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ShipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Shipment::query();

        if ($request->filterType && $request->filterValue) {
            switch ($request->filterType) {
                case 'daily':
                    $query->whereDate('date', $request->filterValue);
                    break;
                case 'range':
                    [$start, $end] = explode('|', $request->filterValue);
                    $query->whereBetween('date', [$start, $end]);
                    break;
                case 'monthly':
                    $query->whereYear('date', Carbon::parse($request->filterValue)->year)
                        ->whereMonth('date', Carbon::parse($request->filterValue)->month);
                    break;
                case 'yearly':
                    $query->whereYear('date', $request->filterValue);
                    break;
            }
        }

        $shipments = $query
            ->with(['clientCostTotal', 'companyCostTotal'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('Home', [
            'shipments' => $shipments,
        ]);
    }

    public function add()
    {
        return Inertia::render('Shipment/AddNewShipment');
    }

    public function show(Shipment $shipment)
    {
        return Inertia::render('Shipment/ShowShipmentDetail', [
            'shipment' => $shipment->load([
                'costItems' => function ($query) {
                    $query->orderBy('name');
                },
                'costItems.children' => function ($query) {
                    $query->orderBy('name');
                },
                'clientCostTotal',
                'companyCostTotal',
            ])
        ]);
    }


    public function store(Request $request)
    {
        $validated = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'costs' => 'required|array',
            'costs.*.id' => 'required|uuid',
            'costs.*.name' => 'string',
            'costs.*.amount' => 'required|numeric',
            'costs.*.side' => 'required|in:client,company',
            'costs.*.calculationType' => 'nullable|in:manual,multiply_children',
            'costs.*.type' => 'required|in:fixed,variable',
            'costs.*.parentId' => 'nullable|uuid',
        ])->validate();

        DB::beginTransaction();

        try {
            $shipment = Shipment::create([
                'title' => $validated['title'],
                'date' => $validated['date'],
            ]);

            $costs = collect($validated['costs']);
            $costsById = $costs->keyBy('id')->toArray();

            function calculateAmount(string $id, array &$costsById, array &$calculated = []): float
            {
                // Avoid recalculation if already calculated
                if (isset($calculated[$id])) {
                    return $calculated[$id];
                }

                $cost = $costsById[$id];
                $children = array_filter($costsById, fn($c) => ($c['parentId'] ?? null) === $id);

                // Manual calculation type - use the provided amount only if no children
                if (($cost['calculationType'] ?? null) === 'manual') {
                    // If has children, ignore manual amount and sum children instead
                    if (count($children) > 0) {
                        $sum = 0;
                        foreach ($children as $child) {
                            $sum += calculateAmount($child['id'], $costsById, $calculated);
                        }
                        $costsById[$id]['amount'] = $sum;
                        $calculated[$id] = $sum;
                        return $sum;
                    }

                    // No children, use manual amount
                    $calculated[$id] = floatval($cost['amount']);
                    return $calculated[$id];
                }

                // Multiply children calculation type
                if (($cost['calculationType'] ?? null) === 'multiply_children' && count($children)) {
                    $product = 1;
                    foreach ($children as $child) {
                        $product *= calculateAmount($child['id'], $costsById, $calculated);
                    }
                    $costsById[$id]['amount'] = $product;
                    $calculated[$id] = $product;
                    return $product;
                }

                // Default: sum children if they exist
                if (count($children)) {
                    $sum = 0;
                    foreach ($children as $child) {
                        $sum += calculateAmount($child['id'], $costsById, $calculated);
                    }
                    $costsById[$id]['amount'] = $sum;
                    $calculated[$id] = $sum;
                    return $sum;
                }

                // No children, use original amount
                $calculated[$id] = floatval($cost['amount']);
                return $calculated[$id];
            }

            // Calculate amounts for all costs (optimized to only calculate root costs)
            $calculated = [];
            $rootCosts = collect($costsById)->filter(fn($c) => empty($c['parentId']));

            // Only calculate for root costs, children will be calculated recursively
            foreach ($rootCosts as $rootCost) {
                calculateAmount($rootCost['id'], $costsById, $calculated);
            }

            $insertCostItem = function ($costId, $parentId = null) use (&$insertCostItem, $shipment, $costsById) {
                $cost = $costsById[$costId];

                $item = $shipment->costItems()->create([
                    'id' => $cost['id'],
                    'name' => $cost['name'],
                    'amount' => $cost['amount'],
                    'side' => $cost['side'],
                    'parent_id' => $parentId,
                    'calculation_type' => $cost['calculationType'] ?? 'manual',
                ]);

                $children = collect($costsById)->filter(fn($c) => ($c['parentId'] ?? null) === $costId);

                foreach ($children as $child) {
                    $insertCostItem($child['id'], $item->id);
                }
            };

            foreach ($rootCosts as $rootCost) {
                $insertCostItem($rootCost['id'], null);
            }

            $totals = [
                'client' => ['fixed' => 0, 'variable' => 0],
                'company' => ['fixed' => 0, 'variable' => 0],
            ];

            // Only count root level costs (costs without parentId)
            foreach ($costsById as $cost) {
                if (empty($cost['parentId'])) {
                    $totals[$cost['side']][$cost['type']] += floatval($cost['amount']);
                }
            }

            foreach ($totals as $side => $group) {
                ShipmentCostTotal::updateOrCreate(
                    ['shipment_id' => $shipment->id, 'side' => $side],
                    [
                        'total_fixed' => $group['fixed'],
                        'total_variable' => $group['variable'],
                        'total_all' => $group['fixed'] + $group['variable'],
                    ]
                );
            }

            DB::commit();

            return redirect()->route('shipments.show', $shipment->id)
                ->with('success', 'Shipment dan biaya berhasil disimpan.');
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }
}
