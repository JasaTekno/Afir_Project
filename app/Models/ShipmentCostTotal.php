<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShipmentCostTotal extends Model
{
    protected $fillable = [
        'shipment_id',
        'side',
        'total_fixed',
        'total_variable',
        'total_all',
    ];

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }
}

