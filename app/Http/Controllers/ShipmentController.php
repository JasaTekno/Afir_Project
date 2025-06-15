<?php

namespace App\Http\Controllers;

use App\Models\CostItem;
use App\Models\Shipment;
use App\Models\ShipmentCostTotal;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ShipmentController extends Controller
{
    protected function storeCostItemsRecursive(array $items, string $shipmentId, string $side, ?string $parentId = null)
    {
        foreach ($items as $item) {
            $costItem = CostItem::create([
                'shipment_id' => $shipmentId,
                'side' => $side,
                'name' => $item['name'],
                'amount' => $item['amount'] ?? 0,
                'calculation_type' => $item['calculation_type'] ?? 'manual',
                'type' => $item['type'] ?? 'fixed',
                'parent_id' => $parentId,
            ]);

            if (!empty($item['children'])) {
                $this->storeCostItemsRecursive($item['children'], $shipmentId, $side, $costItem->id);
            }
        }
    }

    protected function calculateAmount(string $id, array &$costsById, array &$calculated = []): float
    {
        if (isset($calculated[$id])) {
            return $calculated[$id];
        }

        $cost = $costsById[$id];
        $children = array_filter($costsById, fn($c) => ($c['parentId'] ?? null) === $id);

        if (($cost['calculation_type'] ?? null) === 'manual') {
            if (count($children) > 0) {
                $sum = 0;
                foreach ($children as $child) {
                    $sum += $this->calculateAmount($child['id'], $costsById, $calculated);
                }
                $costsById[$id]['amount'] = $sum;
                $calculated[$id] = $sum;
                return $sum;
            }

            $calculated[$id] = floatval($cost['amount']);
            return $calculated[$id];
        }

        if (($cost['calculation_type'] ?? null) === 'multiply_children' && count($children)) {
            $product = 1;
            foreach ($children as $child) {
                $product *= $this->calculateAmount($child['id'], $costsById, $calculated);
            }
            $costsById[$id]['amount'] = $product;
            $calculated[$id] = $product;
            return $product;
        }

        if (count($children)) {
            $sum = 0;
            foreach ($children as $child) {
                $sum += $this->calculateAmount($child['id'], $costsById, $calculated);
            }
            $costsById[$id]['amount'] = $sum;
            $calculated[$id] = $sum;
            return $sum;
        }

        $calculated[$id] = floatval($cost['amount']);
        return $calculated[$id];
    }

    protected function flattenCosts(array $nestedCosts, ?string $parentId = null, array &$flat = []): array
    {
        foreach ($nestedCosts as $node) {
            $id = $node['id'] ?? (string) Str::uuid();

            $flat[$id] = [
                'id' => $id,
                'name' => $node['name'],
                'amount' => $node['amount'] ?? 0,
                'type' => $node['type'] ?? 'fixed',
                'calculation_type' => $node['calculation_type'] ?? 'manual',
                'parentId' => $parentId,
            ];

            if (!empty($node['children'])) {
                $this->flattenCosts($node['children'], $id, $flat);
            }
        }

        return $flat;
    }

    protected function calculateAmountRecursive(array &$items): void
    {
        $flat = [];
        $this->flattenCosts($items, null, $flat);
        $calculated = [];

        foreach ($flat as $id => $_) {
            $this->calculateAmount($id, $flat, $calculated);
        }

        $this->applyCalculatedAmountToNested($items, $flat);
    }

    protected function applyCalculatedAmountToNested(array &$items, array $flat): void
    {
        foreach ($items as &$item) {
            if (isset($flat[$item['id']])) {
                $item['amount'] = $flat[$item['id']]['amount'];
            }

            if (!empty($item['children'])) {
                $this->applyCalculatedAmountToNested($item['children'], $flat);
            }
        }
    }


    protected function recalculateTotalForSide(Shipment $shipment, string $side)
    {
        $totalFixed = $shipment->costItems()
            ->where('side', $side)
            ->where('type', 'fixed')
            ->whereNull('parent_id')
            ->sum('amount');

        $totalVariable = $shipment->costItems()
            ->where('side', $side)
            ->where('type', 'variable')
            ->whereNull('parent_id')
            ->sum('amount');

        ShipmentCostTotal::updateOrCreate(
            ['shipment_id' => $shipment->id, 'side' => $side],
            [
                'total_fixed' => $totalFixed,
                'total_variable' => $totalVariable,
                'total_all' => $totalFixed + $totalVariable,
            ]
        );
    }


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

    public function editCost(Shipment $shipment, Request $request)
    {
        $side = $request->query('side', 'company');
        $costItems = $shipment->costItems()->where('side', $side)->get();

        return Inertia::render('Shipment/EditShipmentCost', [
            'shipment' => $shipment,
            'costItems' => $costItems,
            'side' => $side,
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
            'costs.*.calculation_type' => 'nullable|in:manual,multiply_children',
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

            $calculated = [];
            $rootCosts = collect($costsById)->filter(fn($c) => empty($c['parentId']));

            foreach ($rootCosts as $rootCost) {
                $this->calculateAmount($rootCost['id'], $costsById, $calculated);
            }

            $insertCostItem = function ($costId, $parentId = null, $side = 'client') use (&$insertCostItem, $shipment, $costsById) {
                $cost = $costsById[$costId];

                $item = $shipment->costItems()->create([
                    'id' => Str::uuid(),
                    'name' => $cost['name'],
                    'amount' => $cost['amount'],
                    'side' => $side,
                    'type' => $cost['type'],
                    'parent_id' => $parentId,
                    'calculation_type' => $cost['calculation_type'] ?? 'manual',
                ]);


                $children = collect($costsById)->filter(fn($c) => ($c['parentId'] ?? null) === $costId);

                foreach ($children as $child) {
                    $insertCostItem($child['id'], $item->id, $side);
                }
            };

            foreach (['client', 'company'] as $side) {
                foreach ($rootCosts as $rootCost) {
                    $insertCostItem($rootCost['id'], null, $side);
                }
            }

            $totals = [
                'client' => ['fixed' => 0, 'variable' => 0],
                'company' => ['fixed' => 0, 'variable' => 0],
            ];

            foreach (['client', 'company'] as $side) {
                $totals[$side]['fixed'] = $shipment->costItems()
                    ->where('side', $side)
                    ->where('type', 'fixed')
                    ->whereNull('parent_id')
                    ->sum('amount');

                $totals[$side]['variable'] = $shipment->costItems()
                    ->where('side', $side)
                    ->where('type', 'variable')
                    ->whereNull('parent_id')
                    ->sum('amount');
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

    public function updateCost(Request $request, Shipment $shipment)
    {
        $validated = $request->validate([
            'side' => ['required', 'in:client,company'],
            'costs' => ['required', 'array'],
        ]);

        try {
            DB::transaction(function () use ($shipment, $validated) {
                CostItem::where('shipment_id', $shipment->id)
                    ->where('side', $validated['side'])
                    ->delete();

                $this->calculateAmountRecursive($validated['costs']);

                $this->storeCostItemsRecursive($validated['costs'], $shipment->id, $validated['side']);

                $this->recalculateTotalForSide($shipment, $validated['side']);
            });

            return redirect()->route('shipments.show', $shipment->id)
                ->with('success', 'Shipment dan biaya berhasil diubah.');
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ], 500);
        }
    }
}
