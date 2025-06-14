import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type CostItemBase = {
    id: string;
    name: string;
    amount: string;
    parentId: string | null;
    children: CostItemBase[];
    calculationType: 'manual' | 'multiply_children';
    costType: 'fixed' | 'variable';
};

export const countCostItems = (items: CostItemBase[]): number => {
    return items.reduce(
        (acc, item) => acc + 1 + countCostItems(item.children),
        0,
    );
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

export const useShipmentCostForm = () => {
    const [fixedCosts, setFixedCosts] = useState<CostItemBase[]>([]);
    const [variableCosts, setVariableCosts] = useState<CostItemBase[]>([]);

    const addRootCostItem = (costType: 'fixed' | 'variable') => {
        const newItem: CostItemBase = {
            id: uuidv4(),
            name: '',
            amount: '',
            parentId: null,
            children: [],
            calculationType: 'manual',
            costType,
        };

        if (costType === 'fixed') {
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

    const handleAddSubCost = (
        costType: 'fixed' | 'variable',
        parentId: string,
    ) => {
        const newItem: CostItemBase = {
            id: uuidv4(),
            name: '',
            amount: '',
            parentId,
            children: [],
            calculationType: 'manual',
            costType,
        };

        if (costType === 'fixed') {
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
