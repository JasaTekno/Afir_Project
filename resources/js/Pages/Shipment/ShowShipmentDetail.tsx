/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Authenticated from '@/Layouts/AuthenticatedLayout';
import { formatted } from '@/lib/utils';
import { ShipmentDetailProps } from '@/types';
import {
    Building2,
    CalendarDays,
    DollarSign,
    FileText,
    Receipt,
    TrendingUp,
    User,
} from 'lucide-react';

const ShowShipmentDetail = ({ shipment }: ShipmentDetailProps) => {
    const clientCosts = shipment.cost_items.filter(
        (i) => i.side === 'client' && !i.parent_id,
    );
    const companyCosts = shipment.cost_items.filter(
        (i) => i.side === 'company' && !i.parent_id,
    );

    const profit =
        Number(shipment.client_cost_total.total_all) -
        Number(shipment.company_cost_total.total_all);
    const profitMargin = (
        (profit / Number(shipment.client_cost_total.total_all)) *
        100
    ).toFixed(1);

    const CostItemNode = ({
        item,
        allItems,
        level,
    }: {
        item: any;
        allItems: any[];
        level: number;
    }) => {
        const children = allItems.filter((i) => i.parent_id === item.id);

        return (
            <div>
                <div
                    className={`flex items-center justify-between rounded-md bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/50`}
                    style={{ paddingLeft: `${level * 16}px` }}
                >
                    <span className="text-sm font-medium text-muted-foreground">
                        {item.name || 'Unnamed Item'}
                    </span>
                    <span className="text-sm font-semibold">
                        {formatted(Number(item.amount))}
                    </span>
                </div>

                {children.length > 0 && (
                    <div className="space-y-1">
                        {children.map((child) => (
                            <CostItemNode
                                key={child.id}
                                item={child}
                                allItems={allItems}
                                level={level + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const CostItemsCard = ({
        title,
        icon: Icon,
        costs,
        totals,
    }: {
        title: string;
        icon: any;
        costs: typeof clientCosts;
        totals: any;
        variant?: 'default' | 'secondary';
    }) => (
        <Card className="h-fit">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="h-5 w-5" />
                    {title}
                </CardTitle>
                <CardDescription>
                    {costs.length} item{costs.length !== 1 ? 's' : ''} cost
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Cost Items */}
                <div className="space-y-2">
                    {costs.length > 0 ? (
                        <div className="space-y-2">
                            {costs.map((cost) => (
                                <CostItemNode
                                    key={cost.id}
                                    item={cost}
                                    allItems={shipment.cost_items}
                                    level={0}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <FileText className="mb-2 h-8 w-8" />
                            <p className="text-sm">No cost item</p>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Total Fixed Cost
                        </span>
                        <span className="text-sm font-medium">
                            {formatted(Number(totals.total_fixed))}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Total Variable Cost
                        </span>
                        <span className="text-sm font-medium">
                            {formatted(Number(totals.total_variable))}
                        </span>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between rounded-lg border bg-primary/5 p-3">
                        <span className="font-semibold">Total Cost</span>
                        <span className="text-lg font-bold text-primary">
                            {formatted(Number(totals.total_all))}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const MetricCard = ({
        title,
        value,
        icon: Icon,
        description,
        variant = 'default',
    }: {
        title: string;
        value: string;
        icon: any;
        description?: string;
        variant?: 'default' | 'success' | 'destructive';
    }) => {
        const getVariantStyles = () => {
            switch (variant) {
                case 'success':
                    return 'border-green-200 bg-green-50/50';
                case 'destructive':
                    return 'border-red-200 bg-red-50/50';
                default:
                    return 'border-border';
            }
        };

        const getIconStyles = () => {
            switch (variant) {
                case 'success':
                    return 'text-green-600';
                case 'destructive':
                    return 'text-red-600';
                default:
                    return 'text-primary';
            }
        };

        return (
            <Card className={getVariantStyles()}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                                {title}
                            </p>
                            <p className="text-2xl font-bold">{value}</p>
                            {description && (
                                <p className="text-xs text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                        <div
                            className={`rounded-full bg-background p-3 shadow-sm ${getIconStyles()}`}
                        >
                            <Icon className="h-6 w-6" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <Authenticated
            header={
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold capitalize tracking-tight">
                                {shipment.title}
                            </h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {shipment.date}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="mx-auto my-8 max-w-[1440px] space-y-8">
                {/* Metrics Overview */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <MetricCard
                        title="Profit"
                        value={formatted(profit)}
                        icon={TrendingUp}
                        description={`Margin ${profitMargin}%`}
                        variant={profit >= 0 ? 'success' : 'destructive'}
                    />

                    <MetricCard
                        title="Revenue"
                        value={formatted(
                            Number(shipment.client_cost_total.total_all),
                        )}
                        icon={DollarSign}
                        description="Total dari client"
                    />

                    <MetricCard
                        title="Costs"
                        value={formatted(
                            Number(shipment.company_cost_total.total_all),
                        )}
                        icon={Receipt}
                        description="Total biaya perusahaan"
                    />
                </div>

                {/* Cost Breakdown */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <CostItemsCard
                        title="Client Cost"
                        icon={User}
                        costs={clientCosts}
                        totals={shipment.client_cost_total}
                    />

                    <CostItemsCard
                        title="Company Cost"
                        icon={Building2}
                        costs={companyCosts}
                        totals={shipment.company_cost_total}
                        variant="secondary"
                    />
                </div>

                {/* Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Shipment Information
                        </CardTitle>
                        <CardDescription>
                            Additional detail for this shipment
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    ID Shipment
                                </p>
                                <p className="rounded bg-muted px-2 py-1 font-mono text-sm">
                                    {shipment.id}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Created at
                                </p>
                                <p className="text-sm">
                                    {new Date(
                                        shipment.created_at,
                                    ).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Last Updated
                                </p>
                                <p className="text-sm">
                                    {new Date(
                                        shipment.updated_at,
                                    ).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    Total Items
                                </p>
                                <p className="text-sm">
                                    {shipment.cost_items.length} items
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Authenticated>
    );
};

export default ShowShipmentDetail;
