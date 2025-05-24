import { CostItem, ShipmentCostFormProps } from '@/types';
import { useState } from 'react';
import CostItemInput from './CostItemInput';

import {
    addSubCostItem,
    deleteCostItem,
    updateCostItem,
} from '../Utils/CostItemUtils';

const ShipmentCostForm = ({
    initialFixedCosts,
    initialVariableCosts = [],
}: ShipmentCostFormProps) => {
    const [fixedCosts, setFixedCosts] = useState<CostItem[]>(
        initialFixedCosts.map((c, i) => ({
            id: i + 1,
            name: c.name,
            amount: '',
            parentId: null,
            children: [],
        })),
    );

    const [variableCosts, setVariableCosts] = useState<CostItem[]>(
        initialVariableCosts.map((c, i) => ({
            id: 1000 + i + 1,
            name: c.name,
            amount: '',
            parentId: null,
            children: [],
        })),
    );

    const [nextId, setNextId] = useState(2000);

    const handleChange = (
        id: number,
        updatedItem: CostItem,
        items: CostItem[],
        setItems: React.Dispatch<React.SetStateAction<CostItem[]>>,
    ) => {
        setItems(updateCostItem(id, updatedItem, items));
    };

    const handleAddSubCost = (
        parentId: number,
        items: CostItem[],
        setItems: React.Dispatch<React.SetStateAction<CostItem[]>>,
    ) => {
        const newItem: CostItem = {
            id: nextId,
            name: '',
            amount: '',
            parentId,
            children: [],
        };
        setNextId((id) => id + 1);
        setItems(addSubCostItem(parentId, items, newItem));
    };

    const addVariableCostRoot = () => {
        setVariableCosts((old) => [
            ...old,
            { id: nextId, name: '', amount: '', parentId: null, children: [] },
        ]);
        setNextId((id) => id + 1);
    };

    const flattenCostItems = (
        items: CostItem[],
        parentId: number | null = null,
    ): {
        id: number;
        name: string;
        amount: string;
        parent_id: number | null;
    }[] => {
        return items.flatMap((item) => [
            {
                id: item.id,
                name: item.name,
                amount: item.amount,
                parent_id: parentId,
            },
            ...flattenCostItems(item.children, item.id),
        ]);
    };

    const handleDeleteCostItem = (
        id: number,
        items: CostItem[],
        setItems: React.Dispatch<React.SetStateAction<CostItem[]>>,
    ) => {
        setItems(deleteCostItem(id, items));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const allCosts = [
            ...flattenCostItems(fixedCosts),
            ...flattenCostItems(variableCosts),
        ];

        // Kirim ke backend via Inertia post
        // Inertia.post('/shipments', { cost_items: allCosts, ...dataLain });

        console.log('Submit all cost items:', allCosts);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Fixed Cost</h2>
            {fixedCosts.map((item) => (
                <CostItemInput
                    key={item.id}
                    item={item}
                    onChange={(id, updated) =>
                        handleChange(id, updated, fixedCosts, setFixedCosts)
                    }
                    onAddSubCost={(id) =>
                        handleAddSubCost(id, fixedCosts, setFixedCosts)
                    }
                    onDelete={(id) =>
                        handleDeleteCostItem(id, fixedCosts, setFixedCosts)
                    }
                />
            ))}

            <hr />

            <h2>
                Variable Cost{' '}
                <button type="button" onClick={addVariableCostRoot}>
                    + Tambah Variable Cost Baru
                </button>
            </h2>

            {variableCosts.map((item) => (
                <CostItemInput
                    key={item.id}
                    item={item}
                    onChange={(id, updated) =>
                        handleChange(
                            id,
                            updated,
                            variableCosts,
                            setVariableCosts,
                        )
                    }
                    onAddSubCost={(id) =>
                        handleAddSubCost(id, variableCosts, setVariableCosts)
                    }
                    onDelete={(id) =>
                        handleDeleteCostItem(
                            id,
                            variableCosts,
                            setVariableCosts,
                        )
                    }
                />
            ))}

            <button type="submit" style={{ marginTop: 20 }}>
                Simpan Report
            </button>
        </form>
    );
};

export default ShipmentCostForm;
