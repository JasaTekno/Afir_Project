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
    parent_id: string | null;
    calculation_type: 'manual' | 'multiply_children';
    children: CostItem[];
};

export type FlatCostItem = {
    id: string;
    name: string;
    amount: number;
    type: 'fixed' | 'variable';
    parent_id: string | null;
    calculation_type: 'manual' | 'multiply_children';
};

export type ShipmentCostFormProps = {
    initialFixedCosts: { id: string; name: string; amount: string | null }[];
    initialVariableCosts?: {
        id: string;
        name: string;
        amount: string | null;
    }[];
};

export type ShipmentDetailProps = {
    shipment: {
        id: string;
        title: string;
        date: string;
        created_at: string;
        updated_at: string;
        cost_items: CostItemDetail[];
        client_cost_total: ShipmentCostTotal;
        company_cost_total: ShipmentCostTotal;
    };
};

type ShipmentCostTotal = {
    total_fixed: string;
    total_variable: string;
    total_all: string;
};

type CostItemDetail = {
    id: string;
    name: string;
    amount: string;
    type: string;
    side: 'client' | 'company';
    calculation_type: 'manual' | 'multiply_children';
    parent_id: string | null;
};
