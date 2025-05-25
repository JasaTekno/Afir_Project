<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CostItem extends Model
{
    protected $fillable = [
        'shipment_id',
        'cost_category_id',
        'parent_id',
        'name',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    public function costCategory(): BelongsTo
    {
        return $this->belongsTo(CostCategory::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(CostItem::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(CostItem::class, 'parent_id');
    }
}
