import ShipmentCostForm from '@/Features/Shipment/Components/ShipmentCostForm';
import Authenticated from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const AddNewShipment = () => {
    return (
        <Authenticated>
            <Head title="Add new" />
            <ShipmentCostForm />
        </Authenticated>
    );
};

export default AddNewShipment;
