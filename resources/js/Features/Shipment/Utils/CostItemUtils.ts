import { DualCostItem } from '../Hooks/useShipmentCostForm';

export function updateItemAndMirror(
    clientList: DualCostItem[],
    companyList: DualCostItem[],
    id: string,
    field: 'name' | 'amount',
    value: string,
): [DualCostItem[], DualCostItem[]] {
    const update = (list: DualCostItem[]): DualCostItem[] =>
        list.map((item) => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return { ...item, children: update(item.children) };
        });

    return [update(clientList), update(companyList)];
}

export function addSubCostAndMirror(
    clientList: DualCostItem[],
    companyList: DualCostItem[],
    parent_id: string,
    newSub: DualCostItem,
): [DualCostItem[], DualCostItem[]] {
    const addToParent = (list: DualCostItem[]): DualCostItem[] =>
        list.map((item) => {
            if (item.id === parent_id) {
                return {
                    ...item,
                    children: [...item.children, newSub],
                };
            }
            return {
                ...item,
                children: addToParent(item.children),
            };
        });

    return [addToParent(clientList), addToParent(companyList)];
}

export function deleteItemAndMirror(
    clientList: DualCostItem[],
    companyList: DualCostItem[],
    id: string,
): [DualCostItem[], DualCostItem[]] {
    const deleteRecursive = (list: DualCostItem[]): DualCostItem[] =>
        list
            .filter((item) => item.id !== id)
            .map((item) => ({
                ...item,
                children: deleteRecursive(item.children),
            }));

    return [deleteRecursive(clientList), deleteRecursive(companyList)];
}
