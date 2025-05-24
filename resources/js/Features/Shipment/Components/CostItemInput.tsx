// Define DualCostItem interface locally since it might not be exported
interface DualCostItem {
    id: number;
    name: string;
    amount: string;
    parentId: number | null;
    children: DualCostItem[];
    isClientOwned?: boolean;
    mirroredFromId?: number;
}

interface CostItemInputProps {
    item: DualCostItem;
    onChange: (id: number, updatedItem: DualCostItem) => void;
    onAddSubCost: (id: number) => void;
    onDelete: (id: number) => void;
    readOnlyName?: boolean; // New prop for mirrored items
    readOnlyAmount?: boolean; // New prop for mirrored amounts
    level?: number;
}

const CostItemInput = ({
    item,
    onChange,
    onAddSubCost,
    onDelete,
    readOnlyName = false,
    readOnlyAmount = false,
    level = 0,
}: CostItemInputProps) => {
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnlyName) return; // Prevent changes if readonly

        onChange(item.id, {
            ...item,
            name: e.target.value,
        });
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnlyAmount) return; // Prevent changes if readonly

        onChange(item.id, {
            ...item,
            amount: e.target.value,
        });
    };

    const paddingLeft = level * 20;

    return (
        <div
            style={{
                marginLeft: paddingLeft,
                marginBottom: '10px',
                border: '1px solid #eee',
                padding: '10px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    marginBottom: '10px',
                }}
            >
                <input
                    type="text"
                    placeholder="Cost Name"
                    value={item.name}
                    onChange={handleNameChange}
                    readOnly={readOnlyName}
                    style={{
                        flex: 1,
                        padding: '5px',
                        backgroundColor: readOnlyName ? '#f5f5f5' : 'white',
                        border: readOnlyName
                            ? '1px solid #ccc'
                            : '1px solid #ddd',
                    }}
                />
                <input
                    type="text"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={handleAmountChange}
                    readOnly={readOnlyAmount}
                    style={{
                        width: '120px',
                        padding: '5px',
                        backgroundColor: readOnlyAmount ? '#f5f5f5' : 'white',
                        border: readOnlyAmount
                            ? '1px solid #ccc'
                            : '1px solid #ddd',
                    }}
                />
                <button
                    type="button"
                    onClick={() => onAddSubCost(item.id)}
                    style={{ padding: '5px 10px' }}
                >
                    + Sub
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    style={{
                        padding: '5px 10px',
                        backgroundColor: '#ff4444',
                        color: 'white',
                    }}
                >
                    Delete
                </button>
            </div>

            {(readOnlyName || readOnlyAmount) && (
                <small style={{ color: '#666', fontStyle: 'italic' }}>
                    * Data ini mengikuti dari client
                </small>
            )}

            {item.children &&
                item.children.map((child) => (
                    <CostItemInput
                        key={child.id}
                        item={child}
                        onChange={onChange}
                        onAddSubCost={onAddSubCost}
                        onDelete={onDelete}
                        readOnlyName={readOnlyName}
                        readOnlyAmount={readOnlyAmount}
                        level={level + 1}
                    />
                ))}
        </div>
    );
};

export default CostItemInput;
