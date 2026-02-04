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
        return safeValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            maximumFractionDigits: 0, // Matching image look (no decimals for these cards)
        });
    };

    return (
        <View style={[styles.container, style]}>
            <View style={[styles.card, { backgroundColor: theme.incomeCard }]}>
                <View style={[styles.iconBox, { backgroundColor: '#6366F1' }]}>
                    <Ionicons name="arrow-down" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.label}>{t('home.income')}</Text>
                <Text style={styles.value}>{formatCurrency(income)}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.expenseCard }]}>
                <View style={[styles.iconBox, { backgroundColor: '#F59E0B' }]}>
                    <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.label}>{t('home.expense')}</Text>
                <Text style={styles.value}>{formatCurrency(expense)}</Text>
            </View>
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
        borderRadius: 24,
        padding: 20,
        gap: 8,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
    },
    value: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
    },
});
