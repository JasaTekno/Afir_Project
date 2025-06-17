import { CostItemBase } from '../Hooks/useShipmentCostForm';

export function buildCostTree(flat: CostItemBase[]): CostItemBase[] {
    const map = new Map<string, CostItemBase>();
    const roots: CostItemBase[] = [];

    for (const item of flat) {
        map.set(item.id, { ...item, children: [] });
    }

    for (const item of flat) {
        if (item.parent_id) {
            const parent = map.get(item.parent_id);
            if (parent) {
                parent.children!.push(map.get(item.id)!);
            }
        } else {
            roots.push(map.get(item.id)!);
        }
    }

    return roots;
}
