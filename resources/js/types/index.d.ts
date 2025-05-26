export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

export type CostItem = {
    id: string;
    name: string;
    amount: string;
    parentId: string | null;
    calculationType: 'manual' | 'multiply_children';
    children: CostItem[];
};

export type FlatCostItem = {
    id: string;
    name: string;
    amount: number;
    side: 'client' | 'company';
    type: 'fixed' | 'variable';
    parentId: string | null;
    calculationType: 'manual' | 'multiply_children';
};

export type ShipmentCostFormProps = {
    initialFixedCosts: { id: string; name: string; amount: string | null }[];
    initialVariableCosts?: {
        id: string;
        name: string;
        amount: string | null;
    }[];
};
