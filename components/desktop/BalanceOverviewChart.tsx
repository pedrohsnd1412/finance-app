import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function BalanceOverviewChart() {
    const { t, i18n } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const DATA = [
        { day: t('common.days.sun'), savings: 15, income: 25, expenses: -10 },
        { day: t('common.days.mon'), savings: 20, income: 30, expenses: -15 },
        { day: t('common.days.tue'), savings: 12, income: 20, expenses: -18 },
        { day: t('common.days.wed'), savings: 25, income: 35, expenses: -5 },
        { day: t('common.days.thu'), savings: 18, income: 28, expenses: -12 },
        { day: t('common.days.fri'), savings: 30, income: 45, expenses: -10 },
        { day: t('common.days.sat'), savings: 22, income: 32, expenses: -8 },
    ];

    const chartHeight = 200;
    const maxVal = 50;

    const formatCurrency = (val: number) => {
        return val.toLocaleString(i18n.language === 'pt' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: i18n.language === 'pt' ? 'BRL' : 'USD',
            maximumFractionDigits: 0,
        });
    };

    return (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.amount, { color: theme.text }]}>{formatCurrency(12450)}</Text>
                    <Text style={[styles.label, { color: theme.muted }]}>{t('home.balanceOverview')}</Text>
                </View>

                <View style={styles.controls}>
                    <View style={[styles.periodToggle, { borderColor: theme.border }]}>
                        <Text style={[styles.periodText, { color: theme.text }]}>7d</Text>
                        <Ionicons name="chevron-down" size={14} color={theme.text} />
                    </View>
                    <TouchableOpacity style={styles.chartToggle}>
                        <Ionicons name="bar-chart" size={18} color={theme.muted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.chartToggle}>
                        <Ionicons name="stats-chart" size={18} color={theme.muted} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.legend}>
                <View style={[styles.legendItem]}>
                    <View style={[styles.dot, { backgroundColor: '#FACC15' }]} />
                    <Text style={[styles.legendText, { color: theme.muted }]}>{t('home.savings')}</Text>
                </View>
                <View style={[styles.legendItem]}>
                    <View style={[styles.dot, { backgroundColor: '#84CC16' }]} />
                    <Text style={[styles.legendText, { color: theme.muted }]}>{t('home.stats.income')}</Text>
                </View>
                <View style={[styles.legendItem]}>
                    <View style={[styles.dot, { backgroundColor: '#F87171' }]} />
                    <Text style={[styles.legendText, { color: theme.muted }]}>{t('home.stats.expense')}</Text>
                </View>
            </View>

            <View style={[styles.chartArea, { height: chartHeight }]}>
                {DATA.map((item, index) => (
                    <View key={index} style={styles.barGroup}>
                        <View style={styles.bars}>
                            <View style={[styles.bar, { height: (item.income / maxVal) * chartHeight, backgroundColor: '#84CC16' }]} />
                            <View style={[styles.bar, { height: (item.savings / maxVal) * chartHeight, backgroundColor: '#FACC15', position: 'absolute', bottom: 0 }]} />
                        </View>
                        <Text style={[styles.dayText, { color: theme.muted }]}>{item.day}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    amount: {
        fontSize: 32,
        fontWeight: '800',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    periodToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 8,
    },
    periodText: {
        fontSize: 14,
        fontWeight: '600',
    },
    chartToggle: {
        padding: 4,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
        marginBottom: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '600',
    },
    chartArea: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 10,
    },
    barGroup: {
        alignItems: 'center',
        flex: 1,
    },
    bars: {
        width: 40,
        height: '100%',
        backgroundColor: '#F1F5F9', // Lightest gray for ghost bar
        borderRadius: 8,
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    bar: {
        width: '100%',
        borderRadius: 4,
    },
    dayText: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 12,
    },
});


