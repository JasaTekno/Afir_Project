import Card from '@/Components/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    const [filterType, setFilterType] = useState('all');
    const [filterValue, setFilterValue] = useState('');
    const [rangeFrom, setRangeFrom] = useState('');
    const [rangeTo, setRangeTo] = useState('');

    const applyFilter = () => {
        const query: Record<string, string> = {};

        if (filterType === 'range') {
            if (rangeFrom && rangeTo) {
                query.filterType = 'range';
                query.filterValue = `${rangeFrom}|${rangeTo}`;
            }
        } else if (filterType !== 'all' && filterValue) {
            query.filterType = filterType;
            query.filterValue = filterValue;
        }

        router.get(route('home'), query, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <Select
                            value={filterType}
                            onValueChange={(val) => {
                                setFilterType(val);
                                setFilterValue('');
                            }}
                        >
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Filter Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="daily">Harian</SelectItem>
                                <SelectItem value="range">
                                    Rentang Tanggal
                                </SelectItem>
                                <SelectItem value="monthly">Bulanan</SelectItem>
                                <SelectItem value="yearly">Tahunan</SelectItem>
                            </SelectContent>
                        </Select>

                        {filterType === 'daily' && (
                            <Input
                                type="date"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                className="w-fit"
                            />
                        )}

                        {filterType === 'range' && (
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    onChange={(e) =>
                                        setRangeFrom(e.target.value)
                                    }
                                    placeholder="Dari"
                                    className="w-fit"
                                />
                                <Input
                                    type="date"
                                    onChange={(e) => setRangeTo(e.target.value)}
                                    placeholder="Sampai"
                                    className="w-fit"
                                />
                            </div>
                        )}

                        {filterType === 'monthly' && (
                            <Input
                                type="month"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                className="w-fit"
                            />
                        )}

                        {filterType === 'yearly' && (
                            <Input
                                type="number"
                                placeholder="Tahun"
                                value={filterValue}
                                onChange={(e) => setFilterValue(e.target.value)}
                                className="w-[100px]"
                            />
                        )}

                        <Button onClick={applyFilter}>Apply Filter</Button>
                    </div>

                    <Link href={route('shipment.add')}>
                        <Button variant="outline">+ Add New Shipment</Button>
                    </Link>
                </div>
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
