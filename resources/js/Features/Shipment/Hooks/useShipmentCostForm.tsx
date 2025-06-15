import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type CostItemBase = {
    id: string;
    name: string;
    amount: string;
    parentId: string | null;
    children: CostItemBase[];
    calculation_type: 'manual' | 'multiply_children';
    type: 'fixed' | 'variable';
};

export const countCostItems = (items?: CostItemBase[]): number => {
    if (!Array.isArray(items)) return 0;

    return items.reduce((total, item) => {
        const childrenCount = countCostItems(item.children ?? []);
        return total + 1 + childrenCount;
    }, 0);
};

export const flattenCostTree = (
    items: CostItemBase[],
    parentId: string | null = null,
): CostItemBase[] => {
    return items.flatMap((item) => {
        const current: CostItemBase = {
            ...item,
            parentId,
        };
        const children = flattenCostTree(item.children, item.id);
        return [current, ...children];
    });
};

const initialFixedCosts = [
    { name: 'Gaji Crew' },
    { name: 'Uang Makan Crew' },
    { name: 'Operasional' },
    { name: 'Koordinasi Keamanan' },
];

export const useShipmentCostForm = () => {
    const [fixedCosts, setFixedCosts] = useState<CostItemBase[]>([]);
    const [variableCosts, setVariableCosts] = useState<CostItemBase[]>([]);

    useEffect(() => {
        const initializedFixedCosts: CostItemBase[] = initialFixedCosts.map(
            (item) => ({
                id: uuidv4(),
                name: item.name,
                amount: '',
                parentId: null,
                children: [],
                calculation_type: 'manual',
                type: 'fixed',
            }),
        );

        setFixedCosts(initializedFixedCosts);
    }, []);

    const addRootCostItem = (type: 'fixed' | 'variable') => {
        const newItem: CostItemBase = {
            id: uuidv4(),
            name: '',
            amount: '',
            parentId: null,
            children: [],
            calculation_type: 'manual',
            type,
        };

        if (type === 'fixed') {
            setFixedCosts((prev) => [...prev, newItem]);
        } else {
            setVariableCosts((prev) => [...prev, newItem]);
        }
    };

    const addSubCostToParent = (
        items: CostItemBase[],
        parentId: string,
        newItem: CostItemBase,
    ): CostItemBase[] =>
        items.map((item) => {
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

    const handleAddSubCost = (type: 'fixed' | 'variable', parentId: string) => {
        const newItem: CostItemBase = {
            id: uuidv4(),
            name: '',
            amount: '',
            parentId,
            children: [],
            calculation_type: 'manual',
            type,
        };

        if (type === 'fixed') {
            setFixedCosts((prev) =>
                addSubCostToParent(prev, parentId, newItem),
            );
        } else {
            setVariableCosts((prev) =>
                addSubCostToParent(prev, parentId, newItem),
            );
        }
    };

    return {
        fixedCosts,
        setFixedCosts,
        variableCosts,
        setVariableCosts,
        addRootCostItem,
        handleAddSubCost,
        flattenCostTree,
        countCostItems,
    };
};
