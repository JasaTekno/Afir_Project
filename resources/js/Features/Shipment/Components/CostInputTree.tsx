import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DualCostItem } from '../Hooks/useShipmentCostForm';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Props = {
    items: DualCostItem[];
    onChange: (
        id: string,
        field: 'name' | 'amount' | 'calculationType',
        value: string,
    ) => void;
    onAddSubCost: (parentId: string) => void;
    onDelete: (id: string) => void;
    showReadOnlyIndicator?: boolean;
};

export function CostInputTree({
    items,
    onChange,
    onAddSubCost,
    onDelete,
    showReadOnlyIndicator = false,
}: Props) {
    return (
        <div className="space-y-2">
            {items.map((item) => (
                <div key={item.id} className="ml-4 space-y-2 border-l pl-4">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="relative w-full">
                                <Input
                                    placeholder="Nama biaya"
                                    value={item.name}
                                    onChange={(e) =>
                                        onChange(
                                            item.id,
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    readOnly={
                                        !!(
                                            showReadOnlyIndicator &&
                                            item.mirroredFromId
                                        )
                                    }
                                    className={`${
                                        showReadOnlyIndicator &&
                                        item.mirroredFromId
                                            ? 'bg-gray-100 text-gray-600'
                                            : ''
                                    }`}
                                />
                                {showReadOnlyIndicator &&
                                    item.mirroredFromId && (
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                            🔒
                                        </span>
                                    )}
                            </div>
                            <Input
                                placeholder="-"
                                value={item.amount}
                                onChange={(e) =>
                                    onChange(item.id, 'amount', e.target.value)
                                }
                                type="number"
                                className="w-1/2"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => onAddSubCost(item.id)}
                            >
                                + Sub
                            </Button>
                            {item.costType === 'variable' && (
                                <Select
                                    value={item.calculationType}
                                    onValueChange={(value) =>
                                        onChange(
                                            item.id,
                                            'calculationType',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-[100px]">
                                        <SelectValue placeholder="Tipe Perhitungan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manual">
                                            Manual
                                        </SelectItem>
                                        <SelectItem value="multiply_children">
                                            Kali Sub-Cost
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                            <Button
                                variant="destructive"
                                size="sm"
                                type="button"
                                onClick={() => onDelete(item.id)}
                            >
                                Hapus
                            </Button>
                            {/* {showReadOnlyIndicator && item.mirroredFromId && (
                                <span className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-500">
                                    Mirror dari Client
                                </span>
                            )} */}
                        </div>
                    </div>
                    {item.children.length > 0 && (
                        <CostInputTree
                            items={item.children}
                            onChange={onChange}
                            onAddSubCost={onAddSubCost}
                            onDelete={onDelete}
                            showReadOnlyIndicator={showReadOnlyIndicator}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
