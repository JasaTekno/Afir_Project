/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import {
    DualCostItem,
    flattenCostTree,
    useShipmentCostForm,
} from '../Hooks/useShipmentCostForm';
import { CostInputTree } from './CostInputTree';

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

    const updateCostItem = (
        list: DualCostItem[],
        id: string,
        field: 'name' | 'amount',
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

    const updateMirroredItem = (
        list: DualCostItem[],
        mirroredFromId: string,
        field: 'name' | 'amount',
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
        field: 'name' | 'amount',
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
        field: 'name' | 'amount',
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
        field: 'name' | 'amount',
        value: string,
    ) => {
        setFixedCosts((prev) => ({
            ...prev,
            company: updateCostItem(prev.company, id, field, value),
        }));
    };

    const onCompanyVariableChange = (
        id: string,
        field: 'name' | 'amount',
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

    const handleSubmit = () => {
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

        console.log('DATA KIRIM BACKEND:', allCosts);
    };

    return (
        <div className="grid grid-cols-2 gap-8">
            {/* CLIENT SIDE */}
            <div className="space-y-6 border-r pr-4">
                <h1 className="text-2xl font-bold text-blue-600">
                    CLIENT REPORT
                </h1>

                <div>
                    <h2 className="mb-4 text-xl font-bold">Biaya Tetap</h2>
                    <CostInputTree
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
                    <h2 className="mb-2 text-xl font-bold">Biaya Variabel</h2>
                    <Button
                        onClick={() => addVariableCostRoot('client')}
                        className="mb-4"
                    >
                        + Tambah Biaya Variabel Baru
                    </Button>
                    <CostInputTree
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

            {/* COMPANY SIDE */}
            <div className="space-y-6 pl-4">
                <h1 className="text-2xl font-bold text-green-600">
                    COMPANY REPORT
                </h1>

                <div>
                    <h2 className="mb-4 text-xl font-bold">Biaya Tetap</h2>
                    <CostInputTree
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
                    <h2 className="mb-2 text-xl font-bold">Biaya Variabel</h2>
                    <Button
                        onClick={() => addVariableCostRoot('company')}
                        className="mb-4"
                    >
                        + Tambah Biaya Variabel Baru (Company Only)
                    </Button>
                    <CostInputTree
                        items={variableCosts.company}
                        onChange={onCompanyVariableChange}
                        onAddSubCost={(parentId) =>
                            handleCompanyAddSubCost(parentId, 'variable')
                        }
                        onDelete={onDeleteCompanyVariable}
                        showReadOnlyIndicator={true}
                    />
                </div>
            </div>
            <Button onClick={handleSubmit} className="mt-8 w-full">
                Simpan Semua Biaya
            </Button>
        </div>
    );
};

export default ShipmentCostForm;
