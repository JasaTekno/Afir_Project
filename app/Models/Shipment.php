<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Shipment extends Model
{
    use HasUuids;

    protected $fillable = ['title', 'date'];

    public function costTotals()
    {
        return $this->hasMany(ShipmentCostTotal::class);
    }

    public function costItems()
    {
        return $this->hasMany(CostItem::class);
    }

    public function clientCostTotal()
    {
        return $this->hasOne(ShipmentCostTotal::class)->where('side', 'client');
    }

    public function companyCostTotal()
    {
        return $this->hasOne(ShipmentCostTotal::class)->where('side', 'company');
    }
}
