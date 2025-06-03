<?php

namespace App\Observers;

use App\Models\CostItem;
use App\Models\CostItemAuditLog;
use Illuminate\Support\Facades\Auth;

class CostItemObserver
{
    public function created(CostItem $item): void
    {
        CostItemAuditLog::create([
            'cost_item_id' => $item->id,
            'action' => 'created',
            'old_values' => null,
            'new_values' => $item->toArray(),
            'changed_by' => Auth::user()?->email ?? 'system',
        ]);
    }

    public function updated(CostItem $item): void
    {
        $changes = $item->getChanges();
        $original = collect($item->getOriginal())->only(array_keys($changes));

        if ($changes) {
            CostItemAuditLog::create([
                'cost_item_id' => $item->id,
                'action' => 'updated',
                'old_values' => $original,
                'new_values' => collect($item->getAttributes())->only(array_keys($changes)),
                'changed_by' => Auth::user()?->email ?? 'system',
            ]);
        }
    }

    public function deleted(CostItem $item): void
    {
        CostItemAuditLog::create([
            'cost_item_id' => $item->id,
            'action' => 'deleted',
            'old_values' => $item->toArray(),
            'new_values' => null,
            'changed_by' => Auth::user()?->email ?? 'system',
        ]);
    }
}
