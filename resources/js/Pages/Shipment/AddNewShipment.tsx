import ShipmentCostForm from '@/Features/Shipment/Components/ShipmentCostForm';
import Authenticated from '@/Layouts/AuthenticatedLayout';

const AddNewShipment = () => {
    return (
        <Authenticated>
            <ShipmentCostForm />
        </Authenticated>
    );
};

export default AddNewShipment;
