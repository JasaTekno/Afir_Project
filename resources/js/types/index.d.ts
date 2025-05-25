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
    children: CostItem[];
};

export type FlatCostItem = {
    id: string;
    name: string;
    amount: string;
    parent_id: string | null;
};

export type ShipmentCostFormProps = {
    initialFixedCosts: { id: string; name: string; amount: string | null }[];
    initialVariableCosts?: {
        id: string;
        name: string;
        amount: string | null;
    }[];
};
