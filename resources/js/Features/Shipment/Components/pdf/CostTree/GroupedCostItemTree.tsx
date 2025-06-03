import { Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';
import { CostItemWithChildren } from './buildCostTree';
import { CostItemTree } from './CostItemTree';

export const GroupedCostItemTree = ({
    items,
}: {
    items: CostItemWithChildren[];
}) => {
    const fixedCosts = items.filter((item) => item.type === 'fixed');
    const variableCosts = items.filter((item) => item.type === 'variable');

    return (
        <>
            {fixedCosts.length > 0 && (
                <>
                    <View style={styles.costGroupSeparator}>
                        <Text style={styles.costGroupTitle}>Fixed Cost</Text>
                    </View>
                    {CostItemTree(fixedCosts)}
                </>
            )}

            {variableCosts.length > 0 && (
                <>
                    <View style={styles.costGroupSeparator}>
                        <Text style={styles.costGroupTitle}>Variable Cost</Text>
                    </View>
                    {CostItemTree(variableCosts)}
                </>
            )}
        </>
    );
};
