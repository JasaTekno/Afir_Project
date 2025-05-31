import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

interface Shipment {
    id: string;
    title: string;
    date: string;
    client_cost_total: {
        total_all: number;
    };
    company_cost_total: {
        total_all: number;
    };
}

interface Props {
    shipments: Shipment[];
}

export default function Home({ shipments }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        All shipments report
                    </h2>
                    <div className="flex items-center gap-4">
                        <button></button>
                        <Link href={route('shipment.add')}>Tambah</Link>
                    </div>
                </>
            }
        >
            <Head title="Home" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid w-full grid-cols-1 gap-3 px-4 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                        {shipments.map((data) => (
                            <Link
                                key={data.id}
                                href={route('shipments.show', data.id)}
                                className="w-full"
                            >
                                <Card
                                    title={data.title}
                                    date={data.date}
                                    clientTotal={
                                        data.client_cost_total.total_all
                                    }
                                    companyTotal={
                                        data.company_cost_total.total_all
                                    }
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
