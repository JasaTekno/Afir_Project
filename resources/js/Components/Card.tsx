import { formatted } from '@/lib/utils';
import { ArrowRightIcon } from 'lucide-react';

interface Props {
    title: string;
    date: string;
    clientTotal: number;
    companyTotal: number;
}

const ShipmentCard = ({ title, date, clientTotal, companyTotal }: Props) => {
    return (
        <div className="group relative w-full cursor-pointer rounded-xl border bg-white p-6 shadow-md transition hover:shadow-xl">
            <div className="mb-4 flex items-start justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold capitalize text-gray-800 transition group-hover:text-blue-600">
                        {title}
                    </h2>
                    <p className="text-xs text-gray-500">📅 {date}</p>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400 transition group-hover:text-blue-500" />
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 text-xs font-semibold text-gray-500">
                    Total Cost
                </h3>
                <div className="flex justify-between text-sm font-medium">
                    <div>
                        <span className="block text-gray-600">Client</span>
                        <span className="text-green-600">
                            {formatted(clientTotal)}
                        </span>
                    </div>
                    <div>
                        <span className="block text-gray-600">Company</span>
                        <span className="text-blue-600">
                            {formatted(companyTotal)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShipmentCard;
