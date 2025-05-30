/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import DatePicker from '@/Components/DatePicker';
import PrimaryButton from '@/Components/PrimaryButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FlatCostItem } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent, memo, useState } from 'react';
import {
    DualCostItem,
    flattenCostTree,
    useShipmentCostForm,
} from '../Hooks/useShipmentCostForm';
import { CostInputTree } from './CostInputTree';

const MemoizedCostInputTree = memo(CostInputTree);

const ShipmentCostForm = () => {
    const {
        fixedCosts,
        variableCosts,
        setFixedCosts,
        setVariableCosts,
        handleClientAddSubCost,
        handleCompanyAddSubCost,
        addVariableCostRoot,
    } = useShipmentCostForm();

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date(),
    );

    const { data, post, processing } = useForm<{
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
                console.log(`Update item ${id} field ${field} to`, value);
                return { ...item, [field]: value };
            }
            return {
                ...item,
                children: updateCostItem(item.children, id, field, value),
            };
        });

    const updateMirroredItem = (
        list: DualCostItem[],
        mirroredFromId: string,
        field: 'name' | 'amount' | 'calculationType',
        value: string,
    ): DualCostItem[] =>
        list.map((item) => {
            if (item.mirroredFromId === mirroredFromId) {
                return { ...item, [field]: value };
            }
            return {
                ...item,
                children: updateMirroredItem(
                    item.children,
                    mirroredFromId,
                    field,
                    value,
                ),
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

    const deleteMirroredItem = (
        list: DualCostItem[],
        mirroredFromId: string,
    ): DualCostItem[] => {
        return list
            .filter((item) => item.mirroredFromId !== mirroredFromId)
            .map((item) => ({
                ...item,
                children: deleteMirroredItem(item.children, mirroredFromId),
            }));
    };

    const onClientFixedChange = (
        id: string,
        field: 'name' | 'amount' | 'calculationType',
        value: string,
    ) => {
        setFixedCosts((prev) => {
            const newClient = updateCostItem(prev.client, id, field, value);
            const newCompany = updateMirroredItem(
                prev.company,
                id,
                field,
                value,
            );

            return { client: newClient, company: newCompany };
        });
    };

    const onClientVariableChange = (
        id: string,
        field: 'name' | 'amount' | 'calculationType',
        value: string,
    ) => {
        setVariableCosts((prev) => {
            const newClient = updateCostItem(prev.client, id, field, value);
            const newCompany = updateMirroredItem(
                prev.company,
                id,
                field,
                value,
            );

            return { client: newClient, company: newCompany };
        });
    };

    const onCompanyFixedChange = (
        id: string,
        field: 'name' | 'amount' | 'calculationType',
        value: string,
    ) => {
        setFixedCosts((prev) => ({
            ...prev,
            company: updateCostItem(prev.company, id, field, value),
        }));
    };

    const onCompanyVariableChange = (
        id: string,
        field: 'name' | 'amount' | 'calculationType',
        value: string,
    ) => {
        setVariableCosts((prev) => ({
            ...prev,
            company: updateCostItem(prev.company, id, field, value),
        }));
    };

    const onDeleteClientFixed = (id: string) => {
        setFixedCosts((prev) => {
            const newClient = deleteCostItemRecursively(prev.client, id);
            const newCompany = deleteMirroredItem(prev.company, id);

            return { client: newClient, company: newCompany };
        });
    };

    const onDeleteClientVariable = (id: string) => {
        setVariableCosts((prev) => {
            const newClient = deleteCostItemRecursively(prev.client, id);
            const newCompany = deleteMirroredItem(prev.company, id);

            return { client: newClient, company: newCompany };
        });
    };

    const onDeleteCompanyFixed = (id: string) => {
        setFixedCosts((prev) => ({
            ...prev,
            company: deleteCostItemRecursively(prev.company, id),
        }));
    };

    const onDeleteCompanyVariable = (id: string) => {
        setVariableCosts((prev) => ({
            ...prev,
            company: deleteCostItemRecursively(prev.company, id),
        }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const flatFixedClient = flattenCostTree(
            fixedCosts.client,
            'client',
            'fixed',
        );
        const flatFixedCompany = flattenCostTree(
            fixedCosts.company,
            'company',
            'fixed',
        );

        const flatVariableClient = flattenCostTree(
            variableCosts.client,
            'client',
            'variable',
        );
        const flatVariableCompany = flattenCostTree(
            variableCosts.company,
            'company',
            'variable',
        );

        const allCosts = [
            ...flatFixedClient,
            ...flatFixedCompany,
            ...flatVariableClient,
            ...flatVariableCompany,
        ];

        data.costs = allCosts;

        post(route('shipments.costs.store'), {
            onSuccess: () => console.log('Berhasil disimpan!'),
            onError: (e) => console.log(e),
        });
    };

    return (
        <div className="mx-auto my-8 max-w-[1440px]">
            <form onSubmit={handleSubmit} className="w-full">
                <div className="bg-white px-4 py-4 sm:px-6 lg:px-8">
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold">Nama pengiriman</h3>
                        <Input
                            placeholder="Nama laporan"
                            name="title"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold">
                            Tanggal Pengiriman
                        </h3>
                        <DatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-8 bg-white px-4 py-4 sm:px-6 lg:px-8 xl:grid-cols-2">
                    <div className="space-y-6 border-r pr-4">
                        <h1 className="text-center text-2xl font-bold">
                            CLIENT REPORT
                        </h1>

                        <div>
                            <h2 className="mb-4 text-xl font-bold">
                                Fixed Cost
                            </h2>
                            <MemoizedCostInputTree
                                items={fixedCosts.client}
                                onChange={onClientFixedChange}
                                onAddSubCost={(parentId) =>
                                    handleClientAddSubCost(parentId, 'fixed')
                                }
                                onDelete={onDeleteClientFixed}
                                showReadOnlyIndicator={false}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">
                                    Variable Cost
                                </h2>
                                <Button
                                    onClick={() =>
                                        addVariableCostRoot('client')
                                    }
                                    type="button"
                                >
                                    + Variable Cost
                                </Button>
                            </div>

                            <MemoizedCostInputTree
                                items={variableCosts.client}
                                onChange={onClientVariableChange}
                                onAddSubCost={(parentId) =>
                                    handleClientAddSubCost(parentId, 'variable')
                                }
                                onDelete={onDeleteClientVariable}
                                showReadOnlyIndicator={false}
                            />
                        </div>
                    </div>

                    <div className="space-y-6 pl-4">
                        <h1 className="text-center text-2xl font-bold">
                            COMPANY REPORT
                        </h1>

                        <div>
                            <h2 className="mb-4 text-xl font-bold">
                                Fixed Cost
                            </h2>
                            <MemoizedCostInputTree
                                items={fixedCosts.company}
                                onChange={onCompanyFixedChange}
                                onAddSubCost={(parentId) =>
                                    handleCompanyAddSubCost(parentId, 'fixed')
                                }
                                onDelete={onDeleteCompanyFixed}
                                showReadOnlyIndicator={true}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">
                                    Variable Cost
                                </h2>
                                <Button
                                    onClick={() =>
                                        addVariableCostRoot('company')
                                    }
                                    type="button"
                                >
                                    + Variable Cost (Company Only)
                                </Button>
                            </div>

                            <MemoizedCostInputTree
                                items={variableCosts.company}
                                onChange={onCompanyVariableChange}
                                onAddSubCost={(parentId) =>
                                    handleCompanyAddSubCost(
                                        parentId,
                                        'variable',
                                    )
                                }
                                onDelete={onDeleteCompanyVariable}
                                showReadOnlyIndicator={true}
                            />
                        </div>
                    </div>
                </div>

                <PrimaryButton disabled={processing}>
                    Simpan Semua Biaya
                </PrimaryButton>
            </form>
        </div>
    );
};

export default ShipmentCostForm;
