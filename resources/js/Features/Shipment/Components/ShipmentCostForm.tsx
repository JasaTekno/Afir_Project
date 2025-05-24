import { ShipmentCostFormProps } from '@/types';
import { useState } from 'react';
import CostItemInput from './CostItemInput';

import {
    addSubCostItem,
    deleteCostItem,
    updateCostItem,
} from '../Utils/CostItemUtils';

interface DualCostItem {
    id: number;
    name: string;
    amount: string;
    parentId: number | null;
    children: DualCostItem[];
    isClientOwned?: boolean;
    mirroredFromId?: number;
}

interface DualUserCosts {
    client: DualCostItem[];
    company: DualCostItem[];
}

const ShipmentCostForm = ({
    initialFixedCosts,
    initialVariableCosts = [],
}: ShipmentCostFormProps) => {
    const [fixedCosts, setFixedCosts] = useState<DualUserCosts>({
        client: initialFixedCosts.map((c, i) => ({
            id: i + 1,
            name: c.name,
            amount: '',
            parentId: null,
            children: [],
            isClientOwned: true,
        })),
        company: initialFixedCosts.map((c, i) => ({
            id: 10000 + i + 1,
            name: c.name,
            amount: '',
            parentId: null,
            children: [],
            isClientOwned: false,
            mirroredFromId: i + 1,
        })),
    });

    const [variableCosts, setVariableCosts] = useState<DualUserCosts>({
        client: initialVariableCosts.map((c, i) => ({
            id: 1000 + i + 1,
            name: c.name,
            amount: '',
            parentId: null,
            children: [],
            isClientOwned: true,
        })),
        company: initialVariableCosts.map((c, i) => ({
            id: 20000 + i + 1,
            name: c.name,
            amount: '',
            parentId: null,
            children: [],
            isClientOwned: false,
            mirroredFromId: 1000 + i + 1,
        })),
    });

    const [nextId, setNextId] = useState(30000);

    const mirrorClientItem = (clientItem: DualCostItem): DualCostItem => {
        const companyId = nextId;
        setNextId((id) => id + 1);

        return {
            ...clientItem,
            id: companyId,
            isClientOwned: false,
            mirroredFromId: clientItem.id,
            children: clientItem.children.map((child) =>
                mirrorClientItem(child),
            ),
        };
    };

    // Update mirrored items in company side when client changes
    const updateMirroredItems = (
        updatedClientItem: DualCostItem,
        companyItems: DualCostItem[],
    ): DualCostItem[] => {
        return companyItems.map((item) => {
            if (item.mirroredFromId === updatedClientItem.id) {
                return {
                    ...item,
                    name: updatedClientItem.name,
                    amount: updatedClientItem.amount,
                    children: item.children.map((child) => {
                        const correspondingClientChild =
                            updatedClientItem.children.find(
                                (c) => c.id === child.mirroredFromId,
                            );
                        if (correspondingClientChild) {
                            return updateMirroredItems(
                                correspondingClientChild,
                                [child],
                            )[0];
                        }
                        return child;
                    }),
                };
            }
            return {
                ...item,
                children: updateMirroredItems(updatedClientItem, item.children),
            };
        });
    };

    const handleClientChange = (
        id: number,
        updatedItem: DualCostItem,
        costType: 'fixed' | 'variable',
    ) => {
        const setCosts =
            costType === 'fixed' ? setFixedCosts : setVariableCosts;

        setCosts((prev) => {
            const updatedClient = updateCostItem(id, updatedItem, prev.client);
            const updatedCompany = updateMirroredItems(
                updatedItem,
                prev.company,
            );

            return {
                client: updatedClient,
                company: updatedCompany,
            };
        });
    };

    const handleCompanyChange = (
        id: number,
        updatedItem: DualCostItem,
        costType: 'fixed' | 'variable',
    ) => {
        const setCosts =
            costType === 'fixed' ? setFixedCosts : setVariableCosts;

        setCosts((prev) => ({
            ...prev,
            company: updateCostItem(id, updatedItem, prev.company),
        }));
    };

    const handleClientAddSubCost = (
        parentId: number,
        costType: 'fixed' | 'variable',
    ) => {
        const setCosts =
            costType === 'fixed' ? setFixedCosts : setVariableCosts;

        const newClientItem: DualCostItem = {
            id: nextId,
            name: '',
            amount: '',
            parentId,
            children: [],
            isClientOwned: true,
        };
        setNextId((id) => id + 1);

        const newCompanyItem = mirrorClientItem(newClientItem);

        setCosts((prev) => ({
            client: addSubCostItem(parentId, prev.client, newClientItem),
            company: addSubCostItem(
                prev.company.find((item) => item.mirroredFromId === parentId)
                    ?.id || parentId,
                prev.company,
                newCompanyItem,
            ),
        }));
    };

    const handleCompanyAddSubCost = (
        parentId: number,
        costType: 'fixed' | 'variable',
    ) => {
        const setCosts =
            costType === 'fixed' ? setFixedCosts : setVariableCosts;

        const newItem: DualCostItem = {
            id: nextId,
            name: '',
            amount: '',
            parentId,
            children: [],
            isClientOwned: false,
        };
        setNextId((id) => id + 1);

        setCosts((prev) => ({
            ...prev,
            company: addSubCostItem(parentId, prev.company, newItem),
        }));
    };

    const addVariableCostRoot = (userType: 'client' | 'company') => {
        if (userType === 'client') {
            const newClientItem: DualCostItem = {
                id: nextId,
                name: '',
                amount: '',
                parentId: null,
                children: [],
                isClientOwned: true,
            };
            setNextId((id) => id + 1);

            const newCompanyItem = mirrorClientItem(newClientItem);

            setVariableCosts((prev) => ({
                client: [...prev.client, newClientItem],
                company: [...prev.company, newCompanyItem],
            }));
        } else {
            const newItem: DualCostItem = {
                id: nextId,
                name: '',
                amount: '',
                parentId: null,
                children: [],
                isClientOwned: false,
            };
            setNextId((id) => id + 1);

            setVariableCosts((prev) => ({
                ...prev,
                company: [...prev.company, newItem],
            }));
        }
    };

    // Remove mirrored items when client item is deleted
    const removeMirroredItems = (
        deletedClientId: number,
        companyItems: DualCostItem[],
    ): DualCostItem[] => {
        return companyItems
            .filter((item) => item.mirroredFromId !== deletedClientId)
            .map((item) => ({
                ...item,
                children: removeMirroredItems(deletedClientId, item.children),
            }));
    };

    const handleClientDeleteCostItem = (
        id: number,
        costType: 'fixed' | 'variable',
    ) => {
        const setCosts =
            costType === 'fixed' ? setFixedCosts : setVariableCosts;

        setCosts((prev) => ({
            client: deleteCostItem(id, prev.client),
            company: removeMirroredItems(id, prev.company),
        }));
    };

    const handleCompanyDeleteCostItem = (
        id: number,
        costType: 'fixed' | 'variable',
    ) => {
        const setCosts =
            costType === 'fixed' ? setFixedCosts : setVariableCosts;

        setCosts((prev) => ({
            ...prev,
            company: deleteCostItem(id, prev.company),
        }));
    };

    const flattenCostItems = (
        items: DualCostItem[],
        parentId: number | null = null,
    ): {
        id: number;
        name: string;
        amount: string;
        parent_id: number | null;
        user_type: 'client' | 'company';
        mirrored_from_id?: number;
    }[] => {
        return items.flatMap((item) => [
            {
                id: item.id,
                name: item.name,
                amount: item.amount,
                parent_id: parentId,
                user_type: item.isClientOwned ? 'client' : 'company',
                mirrored_from_id: item.mirroredFromId,
            },
            ...flattenCostItems(item.children, item.id),
        ]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const allCosts = [
            ...flattenCostItems(fixedCosts.client),
            ...flattenCostItems(fixedCosts.company),
            ...flattenCostItems(variableCosts.client),
            ...flattenCostItems(variableCosts.company),
        ];

        console.log('Submit all cost items:', allCosts);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '2rem' }}>
                {/* Client Side */}
                <div
                    style={{
                        flex: 1,
                        border: '1px solid #ccc',
                        padding: '1rem',
                    }}
                >
                    <h1>CLIENT REPORT</h1>

                    <h2>Fixed Cost</h2>
                    {fixedCosts.client.map((item) => (
                        <CostItemInput
                            key={item.id}
                            item={item}
                            onChange={(id, updated) =>
                                handleClientChange(
                                    id,
                                    updated as DualCostItem,
                                    'fixed',
                                )
                            }
                            onAddSubCost={(id) =>
                                handleClientAddSubCost(id, 'fixed')
                            }
                            onDelete={(id) =>
                                handleClientDeleteCostItem(id, 'fixed')
                            }
                        />
                    ))}

                    <hr />

                    <h2>
                        Variable Cost{' '}
                        <button
                            type="button"
                            onClick={() => addVariableCostRoot('client')}
                        >
                            + Tambah Variable Cost Baru
                        </button>
                    </h2>

                    {variableCosts.client.map((item) => (
                        <CostItemInput
                            key={item.id}
                            item={item}
                            onChange={(id, updated) =>
                                handleClientChange(
                                    id,
                                    updated as DualCostItem,
                                    'variable',
                                )
                            }
                            onAddSubCost={(id) =>
                                handleClientAddSubCost(id, 'variable')
                            }
                            onDelete={(id) =>
                                handleClientDeleteCostItem(id, 'variable')
                            }
                        />
                    ))}
                </div>

                {/* Company Side */}
                <div
                    style={{
                        flex: 1,
                        border: '1px solid #ccc',
                        padding: '1rem',
                    }}
                >
                    <h1>COMPANY REPORT</h1>

                    <h2>Fixed Cost</h2>
                    {fixedCosts.company.map((item) => (
                        <CostItemInput
                            key={item.id}
                            item={item}
                            onChange={(id, updated) =>
                                handleCompanyChange(
                                    id,
                                    updated as DualCostItem,
                                    'fixed',
                                )
                            }
                            onAddSubCost={(id) =>
                                handleCompanyAddSubCost(id, 'fixed')
                            }
                            onDelete={(id) =>
                                handleCompanyDeleteCostItem(id, 'fixed')
                            }
                            readOnlyName={!!item.mirroredFromId} // Make name readonly if mirrored
                        />
                    ))}

                    <hr />

                    <h2>
                        Variable Cost{' '}
                        <button
                            type="button"
                            onClick={() => addVariableCostRoot('company')}
                        >
                            + Tambah Variable Cost Baru (Company Only)
                        </button>
                    </h2>

                    {variableCosts.company.map((item) => (
                        <CostItemInput
                            key={item.id}
                            item={item}
                            onChange={(id, updated) =>
                                handleCompanyChange(
                                    id,
                                    updated as DualCostItem,
                                    'variable',
                                )
                            }
                            onAddSubCost={(id) =>
                                handleCompanyAddSubCost(id, 'variable')
                            }
                            onDelete={(id) =>
                                handleCompanyDeleteCostItem(id, 'variable')
                            }
                            readOnlyName={!!item.mirroredFromId} // Make name readonly if mirrored
                        />
                    ))}
                </div>
            </div>

            <button type="submit" style={{ marginTop: 20, width: '100%' }}>
                Simpan Report
            </button>
        </form>
    );
};

export default ShipmentCostForm;
