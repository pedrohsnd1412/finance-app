import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface StatCardProps {
    title: string;
    amount: number;
    change: string;
    trend: 'up' | 'down';
    chartData: { month: string; value: number; active?: boolean; label?: string }[];
    style?: ViewStyle;
}

export function StatCard({ title, amount, change, trend, chartData, style }: StatCardProps) {
    const { t, i18n } = useTranslation();
    const isPositive = trend === 'up';

    const formattedAmount = amount.toLocaleString(i18n.language === 'pt' ? 'pt-BR' : 'en-US', {
        style: 'currency',
        currency: i18n.language === 'pt' ? 'BRL' : 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    return (
        <View style={StyleSheet.flatten([styles.card, style])}>
            <View>
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{t('home.stats.monthlyFlow')}</Text>
                </View>

                <View style={styles.valueRow}>
                    <Text style={styles.amount}>{formattedAmount}</Text>
                </View>
            </View>

            <View style={styles.chartContainer}>
                {chartData.map((val, i) => (
                    <View key={i} style={styles.barColumn}>
                        <View
                            style={[
                                styles.bar,
                                { height: `${val.value}%` },
                                val.active ? styles.barActive : styles.barInactive
                            ]}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1a1b23',
        borderRadius: 32,
        padding: 20,
        minHeight: 180,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    header: {
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '500',
        color: '#9CA3AF',
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    amount: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgeSuccess: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    badgeError: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    textSuccess: {
        color: '#4ade80',
    },
    textError: {
        color: '#f87171',
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 60,
        gap: 6,
    },
    barColumn: {
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    bar: {
        width: '100%',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    barActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    barInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
});
