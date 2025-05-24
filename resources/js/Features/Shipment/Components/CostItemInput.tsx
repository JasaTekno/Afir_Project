import { CostItem } from '@/types';
import React from 'react';

const CostItemInput = ({
    item,
    onChange,
    onAddSubCost,
    onDelete,
    depth = 0,
}: {
    item: CostItem;
    onChange: (id: number, updated: CostItem) => void;
    onAddSubCost: (parentId: number) => void;
    onDelete: (id: number) => void;
    depth?: number;
}) => {
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(item.id, { ...item, name: e.target.value });
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(item.id, { ...item, amount: e.target.value });
    };

    return (
        <div
            style={{
                marginLeft: depth * 20,
                borderLeft: depth ? '1px solid #ccc' : 'none',
                paddingLeft: 10,
                marginBottom: 8,
            }}
        >
            <input
                type="text"
                placeholder="Nama Cost"
                value={item.name}
                onChange={handleNameChange}
                style={{ marginRight: 8 }}
            />
            <input
                type="number"
                placeholder="-"
                value={item.amount}
                onChange={handleAmountChange}
                style={{ marginRight: 8, width: 120 }}
            />
            <button type="button" onClick={() => onAddSubCost(item.id)}>
                Tambah Sub Cost
            </button>
            <button onClick={() => onDelete(item.id)}>Hapus</button>

            {item.children.length > 0 && (
                <div style={{ marginTop: 8 }}>
                    {item.children.map((child) => (
                        <CostItemInput
                            key={child.id}
                            item={child}
                            onChange={onChange}
                            onAddSubCost={onAddSubCost}
                            onDelete={onDelete}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CostItemInput;
