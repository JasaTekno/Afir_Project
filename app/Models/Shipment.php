<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Shipment extends Model
{
    use HasUuids;

    protected $fillable = [
        'title',
        'date',
        'total_fixed',
        'total_variable',
        'total_all',
    ];

    protected $casts = [
        'date' => 'date',
        'total_fixed' => 'decimal:2',
        'total_variable' => 'decimal:2',
        'total_all' => 'decimal:2',
    ];

    protected $keyType = 'string';

    public $incrementing = false;

    public function costItems(): HasMany
    {
        return $this->hasMany(CostItem::class);
    }

    public function costCategories()
    {
        return $this->hasManyThrough(CostCategory::class, CostItem::class, 'shipment_id', 'id', 'id', 'cost_category_id');
    }

    public function fixedCosts($side)
    {
        return $this->costItems()
            ->whereHas('costCategory', fn ($q) => $q->where('type', 'fixed'))
            ->where('side', $side)
            ->whereNull('parent_id');
    }

    public function costTotals()
    {
        return $this->hasMany(ShipmentCostTotal::class);
    }

    public function costTotalFor($side)
    {
        return $this->costTotals()->where('side', $side)->first();
    }

    public function variableCosts($side)
    {
        return $this->costItems()
            ->whereHas('costCategory', fn ($q) => $q->where('type', 'variable'))
            ->where('side', $side)
            ->whereNull('parent_id');
    }

}