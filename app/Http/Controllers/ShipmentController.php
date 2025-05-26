<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\ShipmentCostTotal;
use App\Http\Requests\StoreShipmentCostRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShipmentController extends Controller
{
    public function add()
    {
        return Inertia::render('Shipment/AddNewShipment');
    }

    public function show(Shipment $shipment)
    {
        return Inertia::render('Shipments/Show', [
            'shipment' => $shipment->load([
                'costs',
                'client',
                'company',
                'costs.children'
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

        dd($validated);

        try {
            $shipment = Shipment::create([
                'title' => $validated['title'],
                'date' => $validated['date'],
            ]);

            $costs = collect($validated['costs']);

            $costs = $costs->map(function ($cost) use ($costs) {
                if (($cost['calculation_type'] ?? 'manual') === 'multiply_children') {
                    $children = $costs->where('parent_id', $cost['id']);
                    $product = $children->reduce(function ($carry, $child) {
                        return $carry * floatval($child['amount']);
                    }, 1);
                    $cost['amount'] = $product;
                }

                return $cost;
            });

            $parents = $costs->filter(fn($cost) => empty($cost['parent_id']));
            $children = $costs->filter(fn($cost) => !empty($cost['parent_id']));

            foreach ($parents as $cost) {
                $shipment->costItems()->create([
                    'id' => $cost['id'],
                    'name' => $cost['name'],
                    'amount' => $cost['amount'],
                    'side' => $cost['side'],
                    'parent_id' => null,
                    'calculation_type' => $cost['calculation_type'] ?? 'manual',
                ]);
            }

            foreach ($children as $cost) {
                $shipment->costItems()->create([
                    'id' => $cost['id'],
                    'name' => $cost['name'],
                    'amount' => $cost['amount'],
                    'side' => $cost['side'],
                    'parent_id' => $cost['parent_id'],
                    'calculation_type' => $cost['calculation_type'] ?? 'manual',
                ]);
            }

            $totals = [
                'client' => ['fixed' => 0, 'variable' => 0],
                'company' => ['fixed' => 0, 'variable' => 0],
            ];

            foreach ($costs as $cost) {
                $totals[$cost['side']][$cost['type']] += floatval($cost['amount']);
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
