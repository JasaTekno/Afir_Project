<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CostItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'shipment_id',
        'parent_id',
        'name',
        'side',
        'amount',
        'calculation_type'
    ];

    protected $keyType = 'string';

    public $incrementing = false;

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
