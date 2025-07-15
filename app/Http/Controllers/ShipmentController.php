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
    protected function buildNestedCosts(array $flatCosts): array
    {
        $items = [];
        $map = [];

        foreach ($flatCosts as $cost) {
            $id = $cost['id'];
            $map[$id] = $cost;
            $map[$id]['children'] = [];
        }

        foreach ($map as $id => &$cost) {
            if (!empty($cost['parent_id'])) {
                $map[$cost['parent_id']]['children'][] = &$cost;
            } else {
                $items[] = &$cost;
            }
        }

        return $items;
    }
    protected function storeCostItemsRecursive(array $items, string $shipmentId, string $side, ?string $parent_id = null)
    {
        foreach ($items as $item) {
            $costItem = CostItem::create([
                'shipment_id' => $shipmentId,
                'side' => $side,
                'name' => $item['name'],
                'amount' => $item['amount'] ?? 0,
                'calculation_type' => $item['calculation_type'] ?? 'manual',
                'type' => $item['type'] ?? 'fixed',
                'parent_id' => $parent_id,
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
        $children = array_filter($costsById, fn($c) => ($c['parent_id'] ?? null) === $id);

        switch ($cost['calculation_type'] ?? 'manual') {
            case 'manual':
                $sum = 0;
                foreach ($children as $child) {
                    $sum += $this->calculateAmount($child['id'], $costsById, $calculated);
                }
                if (count($children) === 0) {
                    $sum = floatval($cost['amount'] ?? 0);
                }
                break;

            case 'multiply_children':
                $sum = 1;
                foreach ($children as $child) {
                    $sum *= $this->calculateAmount($child['id'], $costsById, $calculated);
                }
                if (count($children) === 0) {
                    $sum = 0;
                }
                break;

            case 'sum_with_children':
                $sum = floatval($cost['amount'] ?? 0);
                foreach ($children as $child) {
                    $sum += $this->calculateAmount($child['id'], $costsById, $calculated);
                }
                break;

            default:
                $sum = floatval($cost['amount'] ?? 0);
                break;
        }

        $costsById[$id]['amount'] = $sum;
        $calculated[$id] = $sum;
        return $sum;
    }

    protected function flattenCosts(array $nestedCosts, ?string $parent_id = null, array &$flat = []): array
    {
        foreach ($nestedCosts as $node) {
            $id = $node['id'] ?? (string) Str::uuid();

            $flat[$id] = [
                'id' => $id,
                'name' => $node['name'],
                'amount' => $node['amount'] ?? 0,
                'type' => $node['type'] ?? 'fixed',
                'calculation_type' => $node['calculation_type'] ?? 'manual',
                'parent_id' => $parent_id,
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
    protected function saveShipmentCosts(array $flatCosts, Shipment $shipment): void
    {
        $costsById = collect($flatCosts)->keyBy('id')->toArray();

        $calculated = [];
        $rootCosts = collect($costsById)->filter(fn($c) => empty($c['parent_id']));
        foreach ($rootCosts as $rootCost) {
            $this->calculateAmount($rootCost['id'], $costsById, $calculated);
        }

        foreach (['client', 'company'] as $side) {
            $this->insertCostItemsRecursively($shipment, $costsById, $rootCosts, null, $side);
            $this->updateCostTotals($shipment, $side);
        }
    }
    protected function insertCostItemsRecursively(
        Shipment $shipment,
        array $costsById,
        $items,
        ?string $parentId = null,
        string $side = 'client'
    ): void {
        foreach ($items as $item) {
            $id = $item['id'];
            $amount = is_numeric($costsById[$id]['amount']) ? $costsById[$id]['amount'] : 0;

            $created = $shipment->costItems()->create([
                'id' => Str::uuid(),
                'name' => $costsById[$id]['name'],
                'amount' => $amount,
                'side' => $side,
                'type' => $costsById[$id]['type'],
                'parent_id' => $parentId,
                'calculation_type' => $costsById[$id]['calculation_type'] ?? 'manual',
            ]);

            $children = collect($costsById)->filter(fn($c) => ($c['parent_id'] ?? null) === $id);
            $this->insertCostItemsRecursively($shipment, $costsById, $children, $created->id, $side);
        }
    }
    protected function updateCostTotals(Shipment $shipment, string $side): void
    {
        $fixed = $shipment->costItems()
            ->where('side', $side)
            ->where('type', 'fixed')
            ->whereNull('parent_id')
            ->sum('amount');

        $variable = $shipment->costItems()
            ->where('side', $side)
            ->where('type', 'variable')
            ->whereNull('parent_id')
            ->sum('amount');

        ShipmentCostTotal::updateOrCreate(
            ['shipment_id' => $shipment->id, 'side' => $side],
            [
                'total_fixed' => $fixed,
                'total_variable' => $variable,
                'total_all' => $fixed + $variable,
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
            'costs.*.amount' => 'nullable|numeric|min:0',
            'costs.*.calculation_type' => 'nullable|in:manual,multiply_children,sum_with_children',
            'costs.*.type' => 'required|in:fixed,variable',
            'costs.*.parent_id' => 'nullable|uuid',
        ])->validate();

        DB::beginTransaction();

        try {
            $shipment = Shipment::create([
                'title' => $validated['title'],
                'date' => $validated['date'],
            ]);

            $this->saveShipmentCosts($validated['costs'], $shipment);

            DB::commit();

            return redirect()->route('shipments.show', $shipment->id)
                ->with('success', 'Shipment dan biaya berhasil disimpan.');
        } catch (\Throwable $e) {
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

                $nestedCosts = $this->buildNestedCosts($validated['costs']);

                $this->calculateAmountRecursive($nestedCosts);

                $this->storeCostItemsRecursive($nestedCosts, $shipment->id, $validated['side']);

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
