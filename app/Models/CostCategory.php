<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CostCategory extends Model
{
    protected $fillable = [
        'name',
        'type',
        'is_fixed_key',
    ];

    protected $casts = [
        'is_fixed_key' => 'boolean',
    ];

    public function costItems(): HasMany
    {
        return $this->hasMany(CostItem::class);
    }
}
