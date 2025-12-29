/**
 * Donut Chart Component - Category Distribution
 */

import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CategoryData {
    name: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data: CategoryData[];
    size?: number;
    strokeWidth?: number;
}

export function DonutChart({ data, size = 160, strokeWidth = 24 }: DonutChartProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return (
            <View style={[styles.container, { width: size, height: size }]}>
                <View style={[styles.emptyChart, {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: theme.border,
                }]} />
                <View style={styles.centerLabel}>
                    <Text style={StyleSheet.flatten([styles.totalLabel, { color: theme.text, opacity: 0.5 }])}>
                        Sem dados
                    </Text>
                </View>
            </View>
        );
    }

    // Calculate segments for CSS conic-gradient simulation
    let currentAngle = 0;
    const segments = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const startAngle = currentAngle;
        currentAngle += (item.value / total) * 360;
        return {
            ...item,
            percentage,
            startAngle,
            endAngle: currentAngle,
        };
    });

    // For React Native, we'll use a simple visual representation
    // with colored bars showing proportions
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <View style={styles.container}>
            <View style={[styles.chartContainer, { width: size, height: size }]}>
                {/* SVG-like circle segments using views with overflow */}
                <View style={[styles.ring, {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: theme.border,
                }]} />

                {/* Overlay colored segments */}
                {segments.map((segment, index) => {
                    const rotation = segment.startAngle - 90;
                    const segmentPercentage = segment.percentage;

                    return (
                        <View
                            key={index}
                            style={[
                                styles.segment,
                                {
                                    width: size,
                                    height: size,
                                    borderRadius: size / 2,
                                    borderWidth: strokeWidth,
                                    borderColor: 'transparent',
                                    borderTopColor: segment.color,
                                    borderRightColor: segmentPercentage > 25 ? segment.color : 'transparent',
                                    borderBottomColor: segmentPercentage > 50 ? segment.color : 'transparent',
                                    borderLeftColor: segmentPercentage > 75 ? segment.color : 'transparent',
                                    transform: [{ rotate: `${rotation}deg` }],
                                },
                            ]}
                        />
                    );
                })}

                {/* Center hole and label */}
                <View style={[styles.centerHole, {
                    width: size - strokeWidth * 2,
                    height: size - strokeWidth * 2,
                    borderRadius: (size - strokeWidth * 2) / 2,
                    backgroundColor: theme.background,
                }]}>
                    <Text style={StyleSheet.flatten([styles.totalValue, { color: theme.text }])}>
                        R$ {(total / 100).toFixed(0)}
                    </Text>
                    <Text style={StyleSheet.flatten([styles.totalLabel, { color: theme.text, opacity: 0.6 }])}>
                        Total
                    </Text>
                </View>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                {segments.slice(0, 5).map((segment, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                        <Text style={StyleSheet.flatten([styles.legendText, { color: theme.text }])} numberOfLines={1}>
                            {segment.name}
                        </Text>
                        <Text style={StyleSheet.flatten([styles.legendValue, { color: theme.text, opacity: 0.6 }])}>
                            {segment.percentage.toFixed(0)}%
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    chartContainer: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ring: {
        position: 'absolute',
    },
    segment: {
        position: 'absolute',
    },
    emptyChart: {
        position: 'absolute',
    },
    centerHole: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerLabel: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    legend: {
        marginTop: 20,
        width: '100%',
        gap: 8,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        flex: 1,
        fontSize: 13,
    },
    legendValue: {
        fontSize: 13,
        fontWeight: '500',
    },
});
