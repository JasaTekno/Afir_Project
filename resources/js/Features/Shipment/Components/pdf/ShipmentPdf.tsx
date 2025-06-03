import { ShipmentDetailProps } from '@/types';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { buildCostTree } from './CostTree/buildCostTree';
import { GroupedCostItemTree } from './CostTree/GroupedCostItemTree';
import InfoSection from './sections/InfoSection';
import SummarySection from './sections/SummarySection';
import { styles } from './styles';

export const ShipmentPDF = ({
    shipment,
}: {
    shipment: ShipmentDetailProps['shipment'];
}) => {
    const items = shipment.cost_items.filter((item) => item.side === 'client');
    const costTree = buildCostTree(items);
    const currentDate = new Date().toLocaleDateString('id-ID');

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.mainTitle}>SHIPMENT DETAIL</Text>
                    <Text style={styles.subtitle}>Shipping & Cost Report</Text>
                </View>

                <InfoSection shipment={shipment} />

                <View style={styles.costSection}>
                    <View style={styles.costHeader}>
                        <Text style={styles.costHeaderText}>COST DETAILS</Text>
                        <Text style={styles.costHeaderText}>AMOUNT</Text>
                    </View>
                    <View style={styles.costBody}>
                        <GroupedCostItemTree items={costTree} />
                    </View>
                </View>

                <SummarySection shipment={shipment} />

                <Text style={styles.footer}>
                    This document was generated automatically on {currentDate} |
                    Confidential
                </Text>
            </Page>
        </Document>
    );
};
