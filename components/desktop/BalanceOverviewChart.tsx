import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function BalanceOverviewChart() {
    const { t, i18n } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { summary } = useFinanceData('month');

    // Aggregate daily data from transactions
    const chartData = useMemo(() => {
        const dailyData = new Map<string, { income: number; expense: number }>();

        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dailyData.set(key, { income: 0, expense: 0 });
        }

        summary.transactions.forEach(tx => {
            const dateKey = new Date(tx.date).toISOString().split('T')[0];
            if (dailyData.has(dateKey)) {
                const current = dailyData.get(dateKey)!;
                if (tx.type === 'income') {
                    current.income += tx.amount;
                } else {
                    current.expense += tx.amount;
                }
            }
        });

        // Convert to array and format for chart
        return Array.from(dailyData.entries()).map(([dateStr, values]) => {
            const date = new Date(dateStr);
            const dayName = date.toLocaleDateString(i18n.language === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'short' });
            return {
                day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
                income: values.income,
                expenses: values.expense,
                // Savings is effectively income - expense, clamped to 0 for visualization if negative? 
                // Or just net. Let's say savings = income - expense.
                savings: Math.max(0, values.income - values.expense)
            };
        });
    }, [summary.transactions, i18n.language]);

    const maxVal = Math.max(...chartData.map(d => Math.max(d.income, d.expenses))) || 100;
    const chartHeight = 200;

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
                    <Text style={[styles.amount, { color: theme.text }]}>{formatCurrency(summary.totalBalance)}</Text>
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
                {chartData.map((item, index) => (
                    <View key={index} style={styles.barGroup}>
                        <View style={styles.bars}>
                            <View style={[styles.bar, { height: Math.max(4, (item.income / maxVal) * chartHeight), backgroundColor: '#84CC16' }]} />
                            <View style={[styles.bar, { height: Math.max(4, (item.savings / maxVal) * chartHeight), backgroundColor: '#FACC15', position: 'absolute', bottom: 0 }]} />
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


