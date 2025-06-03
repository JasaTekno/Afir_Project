import type { ShipmentDetailProps } from '@/types';

type CostItem = ShipmentDetailProps['shipment']['cost_items'][number];

export type CostItemWithChildren = CostItem & {
    children: CostItemWithChildren[];
};

export const buildCostTree = (items: CostItem[]): CostItemWithChildren[] => {
    const map = new Map<string, CostItemWithChildren>();
    const roots: CostItemWithChildren[] = [];

    items.forEach((item) => {
        map.set(item.id, { ...item, children: [] });
    });

    items.forEach((item) => {
        if (item.parent_id) {
            const parent = map.get(item.parent_id);
            if (parent) {
                parent.children.push(map.get(item.id)!);
            }
        } else {
            roots.push(map.get(item.id)!);
        }
    });

    return roots;
};
