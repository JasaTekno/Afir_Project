import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CostItemBase } from '../Hooks/useShipmentCostForm';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Props = {
    items: CostItemBase[];
    onChange: (
        id: string,
        field: 'name' | 'amount' | 'calculation_type',
        value: string,
    ) => void;
    onAddSubCost: (parentId: string) => void;
    onDelete: (id: string) => void;
};

export function CostInputTree({
    items,
    onChange,
    onAddSubCost,
    onDelete,
}: Props) {
    const renderTree = (items: CostItemBase[], level = 0) => {
        return items.map((item) => (
            <div key={item.id} className="ml-4 space-y-2 border-l pl-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex w-full items-center gap-2">
                        <span className="w-[80px] whitespace-nowrap text-xs text-muted-foreground">
                            {Array(level).fill('—').join('')} Biaya
                        </span>

                        <Input
                            placeholder="Nama biaya"
                            value={item.name}
                            onChange={(e) =>
                                onChange(item.id, 'name', e.target.value)
                            }
                            className="w-[240px]"
                        />

                        <Input
                            placeholder="Jumlah"
                            value={item.amount}
                            onChange={(e) =>
                                onChange(item.id, 'amount', e.target.value)
                            }
                            type="number"
                            className="w-[160px]"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => onAddSubCost(item.id)}
                            className="w-[160px] px-3 text-right"
                        >
                            <span className="inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-right">
                                + Sub dari {item.name || 'item ini'}...
                            </span>
                        </Button>

                        {item.type === 'variable' && (
                            <Select
                                value={item.calculation_type}
                                onValueChange={(value) =>
                                    onChange(item.id, 'calculation_type', value)
                                }
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Tipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="manual">
                                        Manual
                                    </SelectItem>
                                    <SelectItem value="multiply_children">
                                        Kali Sub
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
                    </div>
                </div>

                {(item.children?.length ?? 0) > 0 &&
                    renderTree(item.children!, level + 1)}
            </div>
        ));
    };

    return <div className="space-y-2">{renderTree(items)}</div>;
}
