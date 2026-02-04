import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function FinancialHealthGauge() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const percentage = 75;

    return (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Financial health</Text>
                <View style={[styles.periodToggle, { borderColor: theme.border }]}>
                    <Text style={[styles.periodText, { color: theme.text }]}>30d</Text>
                    <Ionicons name="chevron-down" size={12} color={theme.text} />
                </View>
            </View>

            <Text style={[styles.label, { color: theme.muted }]}>Current status</Text>
            <Text style={[styles.amount, { color: theme.text }]}>$15,780</Text>

            <View style={styles.trendRow}>
                <Ionicons name="arrow-up" size={14} color="#84CC16" />
                <Text style={styles.trendText}>17.5% from last month</Text>
            </View>

            <View style={styles.gaugeContainer}>
                {/* Simplified Gauge using SVG-like view structure */}
                <View style={styles.gaugeBackground}>
                    <View style={[styles.gaugeFill, { transform: [{ rotate: '-90deg' }], borderRightColor: '#84CC16', borderTopColor: '#84CC16' }]} />
                    <View style={styles.gaugeOverlay}>
                        <Text style={[styles.percentage, { color: theme.text }]}>{percentage}%</Text>
                        <Text style={[styles.gaugeDesc, { color: theme.muted }]}>of monthly income saved</Text>
                    </View>
                </View>
            </View>

            <Text style={[styles.footerText, { color: theme.muted }]}>
                Based on aggregated transaction metrics over the past 30 days
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 24,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    periodToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    periodText: {
        fontSize: 12,
        fontWeight: '600',
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
    },
    amount: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 4,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 24,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#84CC16',
    },
    gaugeContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 160,
        marginBottom: 24,
    },
    gaugeBackground: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 15,
        borderColor: '#F1F5F9', // Light gray
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    gaugeFill: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 15,
        borderColor: 'transparent',
        // This is a simplified visual representation
    },
    gaugeOverlay: {
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    percentage: {
        fontSize: 28,
        fontWeight: '800',
    },
    gaugeDesc: {
        fontSize: 11,
        fontWeight: '500',
        textAlign: 'center',
    },
    footerText: {
        fontSize: 11,
        fontWeight: '500',
        lineHeight: 16,
    },
});
