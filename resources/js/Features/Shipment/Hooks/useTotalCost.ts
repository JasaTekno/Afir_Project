import { useMemo } from 'react';
import { CostItemBase } from './useShipmentCostForm';

const calculateAmount = (item: CostItemBase): number => {
    const children = item.children || [];

    const selfAmount = !isNaN(Number(item.amount)) ? Number(item.amount) : 0;

    switch (item.calculation_type) {
        case 'manual':
            return children.length > 0
                ? children.reduce(
                      (acc, child) => acc + calculateAmount(child),
                      0,
                  )
                : selfAmount;

        case 'multiply_children':
            console.log('MASOK MULTIPLY');
            if (children.length === 0) return 0;
            return children.reduce(
                (acc, child) => acc * calculateAmount(child),
                1,
            );

        case 'sum_with_children':
            console.log('MASOK');
            return (
                selfAmount +
                children.reduce((acc, child) => acc + calculateAmount(child), 0)
            );

        default:
            return 0;
    }
};

const sumTotalAmount = (items: CostItemBase[]): number => {
    return items.reduce((total, item) => total + calculateAmount(item), 0);
};

export const useCostTotals = (
    fixedCosts: CostItemBase[],
    variableCosts: CostItemBase[],
) => {
    console.log(variableCosts);
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
