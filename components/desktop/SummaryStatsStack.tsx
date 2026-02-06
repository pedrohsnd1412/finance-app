import { GlassCard } from '@/components/GlassCard';
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
            trend: '+5.1%',
            icon: 'trending-up',
            color: '#10B981',
            bgColor: 'rgba(16, 185, 129, 0.1)'
        },
        {
            label: t('home.stats.totalExpenses'),
            value: expense,
            trend: '-15.5%',
            icon: 'trending-down',
            color: '#F43F5E',
            bgColor: 'rgba(244, 63, 94, 0.1)'
        },
        {
            label: t('home.stats.savedBalance'),
            value: saved,
            trend: '+20.7%',
            icon: 'wallet-outline',
            color: '#6366F1',
            bgColor: 'rgba(99, 102, 241, 0.1)'
        },
    ];

    return (
        <View style={styles.container}>
            {stats.map((stat, index) => (
                <GlassCard key={index} style={styles.card}>
                    <View style={[styles.iconBox, { backgroundColor: stat.bgColor }]}>
                        <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                    </View>
                    <View style={styles.content}>
                        <Text style={styles.label}>{stat.label}</Text>
                        <Text style={styles.value}>{formatCurrency(stat.value)}</Text>
                        <View style={styles.trendRow}>
                            <Ionicons
                                name={stat.trend.startsWith('+') ? 'trending-up' : 'trending-down'}
                                size={12}
                                color={stat.trend.startsWith('+') ? '#10B981' : '#F43F5E'}
                            />
                            <Text style={[styles.trendText, { color: stat.trend.startsWith('+') ? '#10B981' : '#F43F5E' }]}>
                                {stat.trend}
                            </Text>
                        </View>
                    </View>
                </GlassCard>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 20,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    value: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '700',
    },
});
