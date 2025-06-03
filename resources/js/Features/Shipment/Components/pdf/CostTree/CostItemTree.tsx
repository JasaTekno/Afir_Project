import { formatted } from '@/lib/utils';
import { ShipmentDetailProps } from '@/types';
import { Text, View } from '@react-pdf/renderer';
import { styles } from '../styles';

type CostItem = ShipmentDetailProps['shipment']['cost_items'][number];

type CostItemWithChildren = CostItem & {
    children: CostItemWithChildren[];
};

export const CostItemTree = (
    items: CostItemWithChildren[],
    level = 0,
    parentIndex = 0,
): JSX.Element[] => {
    return items.map((item, index) => {
        const globalIndex = parentIndex + index;
        const isEven = globalIndex % 2 === 0;
        const levelStyle =
            level === 0
                ? styles.level0
                : level === 1
                  ? styles.level1
                  : level === 2
                    ? styles.level2
                    : styles.level3;

        return (
            <View key={item.id}>
                <View
                    style={[
                        styles.costRow,
                        isEven ? styles.costRowEven : styles.costRowOdd,
                        levelStyle,
                    ]}
                >
                    <Text style={[styles.costName, levelStyle]}>
                        {level > 0 && '• '}
                        {item.name}
                    </Text>
                    <Text style={styles.costAmount}>
                        {formatted(Number(item.amount))}
                    </Text>
                </View>
                {item.children?.length > 0 && (
                    <View>
                        {CostItemTree(
                            item.children,
                            level + 1,
                            globalIndex + 1,
                        )}
                    </View>
                )}
            </View>
        );
    });
};
