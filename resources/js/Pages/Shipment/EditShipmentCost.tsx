/* eslint-disable @typescript-eslint/no-explicit-any */
import PrimaryButton from '@/Components/PrimaryButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CostInputTree } from '@/Features/Shipment/Components/CostInputTree';
import {
    CostItemBase,
    countCostItems,
} from '@/Features/Shipment/Hooks/useShipmentCostForm';
import { useCostTotals } from '@/Features/Shipment/Hooks/useTotalCost';
import Authenticated from '@/Layouts/AuthenticatedLayout';
import { formatted } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { Building2, Plus } from 'lucide-react';
import { FormEvent, memo, useState } from 'react';
type Props = {
    shipment: any;
    costItems: CostItemBase[];
    side: 'client' | 'company';
};

const MemoizedCostInputTree = memo(CostInputTree);

const EditShipmentCost = ({ shipment, costItems, side }: Props) => {
    const [items, setItems] = useState<CostItemBase[]>(costItems);

    const { data, setData, put, processing } = useForm({
        side,
        costs: costItems,
    });

    const handleChange = (
        id: string,
        field: 'name' | 'amount' | 'calculation_type',
        value: string,
    ) => {
        const updateItem = (list: CostItemBase[]): CostItemBase[] =>
            list.map((item) => {
                if (item.id === id) {
                    return { ...item, [field]: value };
                } else if (item.children?.length) {
                    return {
                        ...item,
                        children: updateItem(item.children),
                    };
                }
                return item;
            });

        setItems((prev) => updateItem(prev));
        const updatedCosts = updateItem(data.costs);
        setData('costs', updatedCosts);
    };

    const handleAddSubCost = (parentId: string) => {
        const findItemById = (
            items: CostItemBase[],
            id: string,
        ): CostItemBase | undefined => {
            for (const item of items) {
                if (item.id === id) return item;
                if (item.children?.length) {
                    const found = findItemById(item.children, id);
                    if (found) return found;
                }
            }
            return undefined;
        };

        const parentItem = findItemById(items, parentId);
        if (!parentItem) return;

        const newItem: CostItemBase = {
            id: crypto.randomUUID(),
            name: '',
            amount: '',
            calculation_type: 'manual',
            parentId,
            type: parentItem.type,
            children: [],
        };

        const addToParent = (list: CostItemBase[]): CostItemBase[] =>
            list.map((item) => {
                if (item.id === parentId) {
                    return {
                        ...item,
                        children: [...(item.children ?? []), newItem],
                    };
                } else if (item.children?.length) {
                    return {
                        ...item,
                        children: addToParent(item.children),
                    };
                }
                return item;
            });

        const updated = addToParent(items);
        setItems(updated);
        setData('costs', updated);
    };

    const handleDelete = (idToDelete: string) => {
        const deleteItem = (list: CostItemBase[]): CostItemBase[] =>
            list
                .filter((item) => item.id !== idToDelete)
                .map((item) => ({
                    ...item,
                    children: deleteItem(item.children || []),
                }));

        const updated = deleteItem(items);
        setItems(updated);
        setData('costs', updated);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        put(`/shipments/${shipment.id}/update-cost`, {
            onSuccess: () => console.log('Berhasil disimpan'),
        });
    };

    const fixedCosts = items.filter((item) => item.type === 'fixed');
    const variableCosts = items.filter((item) => item.type === 'variable');

    const { totalFixedCost, totalVariableCost, totalCost } = useCostTotals(
        fixedCosts,
        variableCosts,
    );

    return (
        <Authenticated header={<h1>Edit {side} Cost</h1>}>
            <Head title="Edit" />

            <div className="mx-auto mt-4 max-w-[1440px] px-4 py-8">
                <Card className="border-0 bg-white shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            COMPANY REPORT
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="w-full space-y-6"
                        >
                            <div className="space-y-3">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">
                                        Fixed Cost
                                    </h3>
                                    <Badge
                                        variant="outline"
                                        className="border-green-200 bg-green-50 text-green-700"
                                    >
                                        {countCostItems(fixedCosts)} Items
                                    </Badge>
                                </div>
                                <div className="space-y-3">
                                    <MemoizedCostInputTree
                                        items={fixedCosts}
                                        onChange={handleChange}
                                        onAddSubCost={handleAddSubCost}
                                        onDelete={handleDelete}
                                    />
                                </div>
                                <h3 className="text-right text-sm text-green-700">
                                    Total Fixed Cost:{' '}
                                    {formatted(totalFixedCost)}
                                </h3>
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                    type="button"
                                    onClick={() => {
                                        const newItem: CostItemBase = {
                                            id: crypto.randomUUID(),
                                            name: '',
                                            amount: '',
                                            parentId: null,
                                            children: [],
                                            calculation_type: 'manual',
                                            type: 'fixed',
                                        };

                                        const updated = [...items, newItem];
                                        setItems(updated);
                                        setData('costs', updated);
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Fixed Cost
                                </Button>
                            </div>
                            <div className="space-y-3">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">
                                        Variable Cost
                                    </h3>
                                    <Badge
                                        variant="outline"
                                        className="border-green-200 bg-green-50 text-green-700"
                                    >
                                        {countCostItems(variableCosts)} Items
                                    </Badge>
                                </div>
                                <div className="space-y-3">
                                    <MemoizedCostInputTree
                                        items={variableCosts}
                                        onChange={handleChange}
                                        onAddSubCost={handleAddSubCost}
                                        onDelete={handleDelete}
                                    />
                                </div>
                                <h3 className="text-right text-sm text-green-700">
                                    Total Variable Cost:{' '}
                                    {formatted(totalVariableCost)}
                                </h3>
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                    type="button"
                                    onClick={() => {
                                        const newItem: CostItemBase = {
                                            id: crypto.randomUUID(),
                                            name: '',
                                            amount: '',
                                            parentId: null,
                                            children: [],
                                            calculation_type: 'manual',
                                            type: 'variable',
                                        };

                                        const updated = [...items, newItem];
                                        setItems(updated);
                                        setData('costs', updated);
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Variable Cost
                                </Button>
                            </div>
                            <div className="flex flex-col justify-end gap-4 pt-4">
                                <h3 className="text-right text-sm text-green-700">
                                    Total Cost: {formatted(totalCost)}
                                </h3>
                                <PrimaryButton
                                    className="ml-auto text-center"
                                    disabled={processing}
                                >
                                    Simpan
                                </PrimaryButton>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Authenticated>
    );
};

export default EditShipmentCost;
