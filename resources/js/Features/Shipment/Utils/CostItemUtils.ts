import { CostItem } from '@/types';

export const updateCostItem = (
    id: number,
    updatedItem: CostItem,
    items: CostItem[],
): CostItem[] => {
    return items.map((item) => {
        if (item.id === id) return updatedItem;
        if (item.children.length) {
            return {
                ...item,
                children: updateCostItem(id, updatedItem, item.children),
            };
        }
        return item;
    });
};

export const addSubCostItem = (
    parentId: number,
    items: CostItem[],
    newItem: CostItem,
): CostItem[] => {
    return items.map((item) => {
        if (item.id === parentId) {
            return { ...item, children: [...item.children, newItem] };
        }
        if (item.children.length) {
            return {
                ...item,
                children: addSubCostItem(parentId, item.children, newItem),
            };
        }
        return item;
    });
};

export const deleteCostItem = (
    idToDelete: number,
    items: CostItem[],
): CostItem[] => {
    return items
        .filter((item) => item.id !== idToDelete)
        .map((item) => ({
            ...item,
            children: deleteCostItem(idToDelete, item.children),
        }));
};
