import ShipmentCostForm from '@/Features/Shipment/Components/ShipmentCostForm';

const initialFixedCosts = [
    { id: 1, name: 'Gaji Crew', amount: null },
    { id: 2, name: 'Uang Makan Crew', amount: null },
    { id: 3, name: 'Biaya Operasional', amount: null },
    { id: 4, name: 'Biaya Koordinasi Keamanan', amount: null },
    { id: 5, name: 'Sewa Kapal', amount: null },
];
const AddNewShipment = () => {
    return <ShipmentCostForm initialFixedCosts={initialFixedCosts} />;
};

export default AddNewShipment;
