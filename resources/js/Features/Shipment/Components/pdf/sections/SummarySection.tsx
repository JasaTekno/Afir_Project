import { formatted } from '@/lib/utils';
import { ShipmentDetailProps } from '@/types';
import { Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';

const SummarySection = ({
    shipment,
}: {
    shipment: ShipmentDetailProps['shipment'];
}) => {
    return (
        <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Fixed Cost:</Text>
                <Text style={styles.summaryValue}>
                    {formatted(Number(shipment.client_cost_total.total_fixed))}
                </Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Variable Cost:</Text>
                <Text style={styles.summaryValue}>
                    {formatted(
                        Number(shipment.client_cost_total.total_variable),
                    )}
                </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>TOTAL COST:</Text>
                <Text style={styles.totalValue}>
                    {formatted(Number(shipment.client_cost_total.total_all))}
                </Text>
            </View>
        </View>
    );
};

export default SummarySection;
