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
    id: number;
    name: string;
    amount: string;
    parentId: number | null;
    children: CostItem[];
};

export type FlatCostItem = {
    id: number;
    name: string;
    amount: string;
    parent_id: number | null;
};

export type ShipmentCostFormProps = {
    initialFixedCosts: { id: number; name: string }[];
    initialVariableCosts?: { id: number; name: string }[];
};
