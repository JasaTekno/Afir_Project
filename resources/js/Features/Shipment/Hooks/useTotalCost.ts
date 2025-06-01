import { useMemo } from 'react';
import { DualCostItem } from './useShipmentCostForm';

const calculateAmount = (item: DualCostItem): number => {
    if (item.calculationType === 'manual') {
        return Number(item.amount);
    } else if (item.calculationType === 'multiply_children') {
        if (!item.children || item.children.length === 0) return 0;
        return item.children.reduce(
            (acc, child) => acc * calculateAmount(child),
            1,
        );
    }
    return 0;
};

const sumTotalAmount = (items: DualCostItem[]): number => {
    return items.reduce((total, item) => total + calculateAmount(item), 0);
};

export const useCostTotals = (
    fixedCosts: { client: DualCostItem[]; company: DualCostItem[] },
    variableCosts: { client: DualCostItem[]; company: DualCostItem[] },
) => {
    console.log('fixedCosts.company', fixedCosts.company);
    console.log('variableCosts.company', variableCosts.company);
    const fixedClientCost = useMemo(
        () => sumTotalAmount(fixedCosts.client),
        [fixedCosts.client],
    );

    const fixedCompanyCost = useMemo(() => {
        console.log('Recalculate fixedCompanyCost');
        return sumTotalAmount(fixedCosts.company);
    }, [fixedCosts.company]);

    const variableClientCost = useMemo(
        () => sumTotalAmount(variableCosts.client),
        [variableCosts.client],
    );

    const variableCompanyCost = useMemo(
        () => sumTotalAmount(variableCosts.company),
        [variableCosts.company],
    );

    return {
        fixedClientCost,
        fixedCompanyCost,
        variableClientCost,
        variableCompanyCost,
        totalClientCost: fixedClientCost + variableClientCost,
        totalCompanyCost: fixedCompanyCost + variableCompanyCost,
    };
};
