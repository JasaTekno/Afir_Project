import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type CostItemBase = {
    id: string;
    name: string;
    amount: string;
    parentId: string | null;
    children: DualCostItem[];
};

export type DualCostItem = CostItemBase & {
    isClientOwned: boolean;
    mirroredFromId?: string;
};

type ShipmentCost = {
    fixed: {
        client: DualCostItem[];
        company: DualCostItem[];
    };
    variable: {
        client: DualCostItem[];
        company: DualCostItem[];
    };
};

type FlatCostItem = {
    id: string;
    name: string;
    amount: number;
    parentId: string | null;
    side: 'client' | 'company';
    type: 'fixed' | 'variable';
};

export const flattenCostTree = (
    items: DualCostItem[],
    side: 'client' | 'company',
    type: 'fixed' | 'variable',
    parentId: string | null = null,
): FlatCostItem[] => {
    return items.flatMap((item) => {
        const current: FlatCostItem = {
            id: item.id,
            name: item.name,
            amount: parseFloat(item.amount) || 0,
            parentId,
            side,
            type,
        };

        const children = flattenCostTree(item.children, side, type, item.id);
        return [current, ...children];
    });
};

export const useShipmentCostForm = () => {
    const initialFixedCosts = [
        { name: 'Gaji Crew' },
        { name: 'Uang Makan Crew' },
        { name: 'Biaya Operasional' },
        { name: 'Biaya Koordinasi Keamanan' },
    ];

    const generateDualCostItem = (base: {
        name: string;
        parentId: string | null;
    }): [DualCostItem, DualCostItem] => {
        const clientId = uuidv4();
        const companyId = uuidv4();

        const clientItem: DualCostItem = {
            id: clientId,
            name: base.name,
            amount: '',
            parentId: base.parentId,
            children: [],
            isClientOwned: true,
        };

        const companyItem: DualCostItem = {
            id: companyId,
            name: base.name,
            amount: '',
            parentId: base.parentId,
            children: [],
            isClientOwned: false,
            mirroredFromId: clientId,
        };

        return [clientItem, companyItem];
    };

    const [fixedCosts, setFixedCosts] = useState<ShipmentCost['fixed']>(() => {
        const clientItems: DualCostItem[] = [];
        const companyItems: DualCostItem[] = [];

        initialFixedCosts.forEach((item) => {
            const [clientItem, companyItem] = generateDualCostItem({
                name: item.name,
                parentId: null,
            });
            clientItems.push(clientItem);
            companyItems.push(companyItem);
        });

        return { client: clientItems, company: companyItems };
    });

    const [variableCosts, setVariableCosts] = useState<
        ShipmentCost['variable']
    >({
        client: [],
        company: [],
    });

    const mirrorClientItem = (clientItem: DualCostItem): DualCostItem => {
        return {
            ...clientItem,
            id: uuidv4(),
            isClientOwned: false,
            mirroredFromId: clientItem.id,
            children: clientItem.children.map(mirrorClientItem),
        };
    };

    const addSubCostToParent = (
        list: DualCostItem[],
        parentId: string,
        newItem: DualCostItem,
    ): DualCostItem[] =>
        list.map((item) => {
            if (item.id === parentId) {
                return {
                    ...item,
                    children: [...item.children, newItem],
                };
            }
            return {
                ...item,
                children: addSubCostToParent(item.children, parentId, newItem),
            };
        });

    const handleClientAddSubCost = (
        parentId: string,
        costType: 'fixed' | 'variable',
    ) => {
        const setCosts =
            costType === 'fixed' ? setFixedCosts : setVariableCosts;

        setCosts((prev) => {
            // Create new client sub-cost
            const newClientSubCost: DualCostItem = {
                id: uuidv4(),
                name: '',
                amount: '',
                parentId,
                children: [],
                isClientOwned: true,
            };

            // Create mirror for company side
            const newCompanySubCost = createMirrorItem(newClientSubCost);

            // Add to client side
            const newClient = addSubCostToParent(
                prev.client,
                parentId,
                newClientSubCost,
            );

            // Add to company side (find parent by mirroredFromId)
            const newCompany = addSubCostToMirroredParent(
                prev.company,
                parentId,
                newCompanySubCost,
            );

            return { client: newClient, company: newCompany };
        });
    };
    const handleCompanyAddSubCost = (
        parentId: string,
        costType: 'fixed' | 'variable',
    ) => {
        const setCosts =
            costType === 'fixed' ? setFixedCosts : setVariableCosts;

        setCosts((prev) => {
            const newCompanySubCost: DualCostItem = {
                id: uuidv4(),
                name: '',
                amount: '',
                parentId,
                children: [],
                isClientOwned: false,
            };

            const newCompany = addSubCostToParent(
                prev.company,
                parentId,
                newCompanySubCost,
            );

            return { ...prev, company: newCompany };
        });
    };

    const addVariableCostRoot = (userType: 'client' | 'company') => {
        if (userType === 'client') {
            const newClientId = uuidv4();
            const newClientItem: DualCostItem = {
                id: newClientId,
                name: '',
                amount: '',
                parentId: null,
                children: [],
                isClientOwned: true,
            };

            const newCompanyItem = mirrorClientItem(newClientItem);

            setVariableCosts((prev) => ({
                client: [...prev.client, newClientItem],
                company: [...prev.company, newCompanyItem],
            }));
        } else {
            const newItem: DualCostItem = {
                id: uuidv4(),
                name: '',
                amount: '',
                parentId: null,
                children: [],
                isClientOwned: false,
            };

            setVariableCosts((prev) => ({
                ...prev,
                company: [...prev.company, newItem],
            }));
        }
    };

    // Helper function to find parent by mirroredFromId and add sub-cost
    const addSubCostToMirroredParent = (
        list: DualCostItem[],
        parentMirroredFromId: string,
        newItem: DualCostItem,
    ): DualCostItem[] =>
        list.map((item) => {
            if (item.mirroredFromId === parentMirroredFromId) {
                return {
                    ...item,
                    children: [...item.children, newItem],
                };
            }
            return {
                ...item,
                children: addSubCostToMirroredParent(
                    item.children,
                    parentMirroredFromId,
                    newItem,
                ),
            };
        });

    // Create mirror of client item
    const createMirrorItem = (clientItem: DualCostItem): DualCostItem => ({
        ...clientItem,
        id: uuidv4(),
        isClientOwned: false,
        mirroredFromId: clientItem.id,
        children: clientItem.children.map(createMirrorItem),
    });

    return {
        fixedCosts,
        setFixedCosts,
        variableCosts,
        setVariableCosts,
        handleClientAddSubCost,
        handleCompanyAddSubCost,
        addVariableCostRoot,
    };
};
