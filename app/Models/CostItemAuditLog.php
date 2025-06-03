<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CostItemAuditLog extends Model
{
    protected $fillable = [
        'cost_item_id',
        'action',
        'old_values',
        'new_values',
        'changed_by',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];
}
