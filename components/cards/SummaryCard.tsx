import { GlassCard } from '@/components/GlassCard';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface SummaryCardProps {
    income: number;
    expense: number;
    style?: ViewStyle;
}

export function SummaryCard({ income = 0, expense = 0, style }: SummaryCardProps) {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const formatCurrency = (value: number): string => {
        const safeValue = value ?? 0;
        return 'R$ ' + safeValue.toLocaleString('pt-BR', {
            maximumFractionDigits: 0,
        });
    };

    return (
        <View style={[styles.container, style]}>
            <GlassCard style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="arrow-down" size={20} color="#10B981" />
                </View>
                <View>
                    <Text style={styles.label}>{t('home.stats.income')}</Text>
                    <Text style={styles.value}>{formatCurrency(income)}</Text>
                </View>
            </GlassCard>

            <GlassCard style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}>
                    <Ionicons name="arrow-up" size={20} color="#F43F5E" />
                </View>
                <View>
                    <Text style={styles.label}>{t('home.stats.expense')}</Text>
                    <Text style={styles.value}>{formatCurrency(expense)}</Text>
                </View>
            </GlassCard>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 16,
    },
    card: {
        flex: 1,
        padding: 20,
        gap: 16,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    value: {
        fontSize: 24,
        fontWeight: '800',
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
        color: '#10B981',
    },
});
