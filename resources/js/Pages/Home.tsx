import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface Shipment {
    id: string;
    title: string;
    date: string;
    client_cost_total?: {
        total_all: string;
    };
    company_cost_total?: {
        total_all: string;
    };
}

interface Props {
    shipments: Shipment[];
}

export default function Home({ shipments }: Props) {
    console.log(shipments);
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    All shipments report
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid w-full grid-cols-2 gap-3 px-4 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
                        <Link href={route('shipments.show', 'ansdansj')}>
                            <Card />
                        </Link>
                        <Card />
                        <Card />
                        <Card />
                        <Card />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
