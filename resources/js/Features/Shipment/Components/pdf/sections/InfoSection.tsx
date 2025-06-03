import { ShipmentDetailProps } from '@/types';
import { Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';

const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(date);
    } catch {
        return dateString;
    }
};

const InfoSection = ({
    shipment,
}: {
    shipment: ShipmentDetailProps['shipment'];
}) => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Information</Text>
            <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Shipment ID:</Text>
                    <Text style={styles.infoValue}>{shipment.id}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Title:</Text>
                    <Text style={styles.infoValue}>{shipment.title}</Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoValue}>
                        {formatDate(shipment.date)}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default InfoSection;
