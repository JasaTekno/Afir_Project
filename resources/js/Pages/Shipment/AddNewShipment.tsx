import ShipmentCostForm from '@/Features/Shipment/Components/ShipmentCostForm';

const initialFixedCosts = [
    { id: 1, name: 'Gaji Crew' },
    { id: 2, name: 'Uang Makan Crew' },
    { id: 3, name: 'Biaya Operasional' },
    { id: 4, name: 'Biaya Koordinasi Keamanan' },
    { id: 5, name: 'Sewa Kapal' },
];
const AddNewShipment = () => {
    return <ShipmentCostForm initialFixedCosts={initialFixedCosts} />;
};

export default AddNewShipment;
