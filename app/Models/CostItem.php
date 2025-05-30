<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CostItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'shipment_id',
        'parent_id',
        'side',
        'calculation_type',
        'name',
        'amount',
    ];

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function parent()
    {
        return $this->belongsTo(CostItem::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(CostItem::class, 'parent_id');
    }
}
