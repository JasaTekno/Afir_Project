import { useMemo } from 'react';
import { CostItemBase } from './useShipmentCostForm';

const calculateAmount = (item: CostItemBase): number => {
    const children = item.children || [];

    if (item.calculation_type === 'manual') {
        const selfAmount = !isNaN(Number(item.amount))
            ? Number(item.amount)
            : 0;
        const childrenAmount = children.reduce(
            (acc, child) => acc + calculateAmount(child),
            0,
        );
        return selfAmount + childrenAmount;
    }

    if (item.calculation_type === 'multiply_children') {
        if (children.length === 0) return 0;
        return children.reduce((acc, child) => acc * calculateAmount(child), 1);
    }

    return 0;
};

const sumTotalAmount = (items: CostItemBase[]): number => {
    return items.reduce((total, item) => total + calculateAmount(item), 0);
};

export const useCostTotals = (
    fixedCosts: CostItemBase[],
    variableCosts: CostItemBase[],
) => {
    const totalFixedCost = useMemo(
        () => sumTotalAmount(fixedCosts),
        [fixedCosts],
    );

    const totalVariableCost = useMemo(
        () => sumTotalAmount(variableCosts),
        [variableCosts],
    );

    const totalCost = totalFixedCost + totalVariableCost;

    return {
        totalFixedCost,
        totalVariableCost,
        totalCost,
    };
};
