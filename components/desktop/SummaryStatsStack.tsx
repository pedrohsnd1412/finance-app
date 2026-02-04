import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

interface SummaryStatsStackProps {
    income: number;
    expense: number;
    saved: number;
}

export function SummaryStatsStack({ income, expense, saved }: SummaryStatsStackProps) {
    const { t, i18n } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const formatCurrency = (val: number) => {
        return val.toLocaleString(i18n.language === 'pt' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: i18n.language === 'pt' ? 'BRL' : 'USD',
            maximumFractionDigits: 0,
        });
    };

    const stats = [
        {
            label: t('home.stats.totalIncome'),
            value: income,
            trend: t('home.stats.fromLastMonth', { percentage: '+5.1%' }),
            icon: 'trending-up',
            color: '#84CC16'
        },
        {
            label: t('home.stats.totalExpenses'),
            value: expense,
            trend: t('home.stats.fromLastMonth', { percentage: '-15.5%' }),
            icon: 'trending-down',
            color: '#F87171'
        },
        {
            label: t('home.stats.savedBalance'),
            value: saved,
            trend: t('home.stats.fromLastMonth', { percentage: '+20.7%' }),
            icon: 'wallet',
            color: '#3B82F6'
        },
    ];

    return (
        <View style={styles.container}>
            {stats.map((stat, index) => (
                <View key={index} style={[styles.card, { backgroundColor: theme.card }]}>
                    <Text style={[styles.label, { color: theme.muted }]}>{stat.label}</Text>
                    <Text style={[styles.value, { color: theme.text }]}>{formatCurrency(stat.value)}</Text>
                    <View style={styles.trendRow}>
                        <Ionicons
                            name={stat.trend.startsWith('+') ? 'arrow-up' : 'arrow-down'}
                            size={14}
                            color={stat.trend.startsWith('+') ? '#84CC16' : '#F87171'}
                        />
                        <Text style={[styles.trendText, { color: stat.trend.startsWith('+') ? '#84CC16' : '#F87171' }]}>
                            {stat.trend}
                        </Text>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        flex: 1,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    value: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 12,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
