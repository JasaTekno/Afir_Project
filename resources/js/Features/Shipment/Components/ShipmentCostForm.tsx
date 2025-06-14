/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import DatePicker from '@/Components/DatePicker';
import PrimaryButton from '@/Components/PrimaryButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatted } from '@/lib/utils';
import { FlatCostItem } from '@/types';
import { useForm } from '@inertiajs/react';
import { Calendar, Plus, Ship, User } from 'lucide-react';
import { FormEvent, memo, useState } from 'react';
import {
    countCostItems,
    DualCostItem,
    flattenCostTree,
    useShipmentCostForm,
} from '../Hooks/useShipmentCostForm';
import { useCostTotals } from '../Hooks/useTotalCost';
import { CostInputTree } from './CostInputTree';

const MemoizedCostInputTree = memo(CostInputTree);

const ShipmentCostForm = () => {
    const {
        fixedCosts,
        variableCosts,
        setFixedCosts,
        setVariableCosts,
        handleClientAddSubCost,
        addVariableCostRoot,
    } = useShipmentCostForm();

    const { fixedClientCost, variableClientCost, totalClientCost } =
        useCostTotals(fixedCosts, variableCosts);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date(),
    );

    const { data, setData, post, processing, errors } = useForm<{
        title: string;
        date: string;
        costs: FlatCostItem[];
    }>({
        title: '',
        date: '',
        costs: [],
    });

    const updateCostItem = (
        list: DualCostItem[],
        id: string,
        field: 'name' | 'amount' | 'calculationType',
        value: string,
    ): DualCostItem[] =>
        list.map((item) => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return {
                ...item,
                children: updateCostItem(item.children, id, field, value),
            };
        });

    const deleteCostItemRecursively = (
        list: DualCostItem[],
        id: string,
    ): DualCostItem[] => {
        return list
            .filter((item) => item.id !== id)
            .map((item) => ({
                ...item,
                children: deleteCostItemRecursively(item.children, id),
            }));
    };

    const onClientFixedChange = (
        id: string,
        field: 'name' | 'amount' | 'calculationType',
        value: string,
    ) => {
        setFixedCosts((prev) => {
            const newClient = updateCostItem(prev.client, id, field, value);

            return { client: newClient };
        });
    };

    const onClientVariableChange = (
        id: string,
        field: 'name' | 'amount' | 'calculationType',
        value: string,
    ) => {
        setVariableCosts((prev) => {
            const newClient = updateCostItem(prev.client, id, field, value);
            return { client: newClient };
        });
    };

    const onDeleteClientFixed = (id: string) => {
        setFixedCosts((prev) => {
            const newClient = deleteCostItemRecursively(prev.client, id);

            return { client: newClient };
        });
    };

    const onDeleteClientVariable = (id: string) => {
        setVariableCosts((prev) => {
            const newClient = deleteCostItemRecursively(prev.client, id);

            return { client: newClient };
        });
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const flatFixedClient = flattenCostTree(
            fixedCosts.client,
            'client',
            'fixed',
        );

        const flatVariableClient = flattenCostTree(
            variableCosts.client,
            'client',
            'variable',
        );

        const allCosts = [...flatFixedClient, ...flatVariableClient];

        data.costs = allCosts;

        console.log(data);

        // post(route('shipments.costs.store'), {
        //     onSuccess: () => console.log('Berhasil disimpan!'),
        //     onError: (e) => console.log(e),
        // });
    };

    return (
        <div className="mx-auto mt-4 max-w-[1440px] px-4 py-8">
            <form onSubmit={handleSubmit} className="w-full">
                <Card className="mb-8 border-0 bg-white shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <Ship className="h-5 w-5 text-blue-600" />
                            SHIPMENT INFORMATION
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="shipment-name"
                                    className="font-medium text-gray-700"
                                >
                                    Shipping Name
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="Nama laporan"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="shipment-date"
                                    className="font-medium text-gray-700"
                                >
                                    Delivery Date
                                </Label>
                                <div className="relative">
                                    <DatePicker
                                        value={selectedDate}
                                        onChange={(date) => {
                                            setSelectedDate(date);
                                            setData(
                                                'date',
                                                date?.toISOString() ?? '',
                                            );
                                        }}
                                        className="pl-10"
                                    />
                                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                </div>
                                {errors.date && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.date}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="mb-8">
                    {/* Client Report */}
                    <Card className="border-0 bg-white shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                <User className="h-5 w-5 text-green-600" />
                                CLIENT REPORT
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">
                                        Fixed Cost
                                    </h3>
                                    <Badge
                                        variant="outline"
                                        className="border-green-200 bg-green-50 text-green-700"
                                    >
                                        {countCostItems(fixedCosts.client)}{' '}
                                        Items
                                    </Badge>
                                </div>
                                <div className="space-y-3">
                                    <MemoizedCostInputTree
                                        items={fixedCosts.client}
                                        onChange={onClientFixedChange}
                                        onAddSubCost={(parentId) =>
                                            handleClientAddSubCost(
                                                parentId,
                                                'fixed',
                                            )
                                        }
                                        onDelete={onDeleteClientFixed}
                                        showReadOnlyIndicator={false}
                                    />
                                </div>
                                <h3 className="text-right text-sm text-green-700">
                                    Total Fixed Cost:{' '}
                                    {formatted(fixedClientCost)}
                                </h3>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-800">
                                        Variable Cost
                                    </h3>
                                    <Badge
                                        variant="outline"
                                        className="border-green-200 bg-green-50 text-green-700"
                                    >
                                        {countCostItems(variableCosts.client)}{' '}
                                        Items
                                    </Badge>
                                </div>
                                <div className="space-y-3">
                                    <MemoizedCostInputTree
                                        items={variableCosts.client}
                                        onChange={onClientVariableChange}
                                        onAddSubCost={(parentId) =>
                                            handleClientAddSubCost(
                                                parentId,
                                                'variable',
                                            )
                                        }
                                        onDelete={onDeleteClientVariable}
                                        showReadOnlyIndicator={false}
                                    />
                                </div>
                                <h3 className="text-right text-sm text-green-700">
                                    Total Variable Cost:{' '}
                                    {formatted(variableClientCost)}
                                </h3>
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                    type="button"
                                    onClick={() =>
                                        addVariableCostRoot('client')
                                    }
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Variable Cost
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-4">
                    <h3 className="text-right text-sm text-green-700">
                        Total Cost: {formatted(totalClientCost)}
                    </h3>

                    <PrimaryButton
                        disabled={processing}
                        className="ml-auto text-center"
                    >
                        Save all cost
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
};

export default ShipmentCostForm;
