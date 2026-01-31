import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface SummaryCardProps {
    income: number;
    expense: number;
    style?: ViewStyle;
}

export function SummaryCard({ income = 0, expense = 0, style }: SummaryCardProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const formatCurrency = (value: number): string => {
        const safeValue = value ?? 0;
        return safeValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    const difference = (income ?? 0) - (expense ?? 0);
    const isPositive = difference >= 0;

    return (
        <View style={StyleSheet.flatten([styles.card, { backgroundColor: theme.card, borderColor: theme.border }, style])}>
            <View style={styles.row}>
                <View style={styles.item}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.success + '15' }]}>
                        <Ionicons name="arrow-down" size={16} color={theme.success} />
                    </View>
                    <View>
                        <Text style={[styles.label, { color: theme.muted }]}>Ganhos</Text>
                        <Text style={[styles.value, { color: theme.text }]}>
                            {formatCurrency(income)}
                        </Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.item}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.error + '15' }]}>
                        <Ionicons name="arrow-up" size={16} color={theme.error} />
                    </View>
                    <View>
                        <Text style={[styles.label, { color: theme.muted }]}>Gastos</Text>
                        <Text style={[styles.value, { color: theme.text }]}>
                            {formatCurrency(expense)}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={[styles.footer, { backgroundColor: theme.background + '50' }]}>
                <Text style={[styles.footerLabel, { color: theme.muted }]}>Saldo do período</Text>
                <Text style={[styles.footerValue, { color: isPositive ? theme.success : theme.error }]}>
                    {isPositive ? '+' : ''}{formatCurrency(difference)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
    },
    item: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        width: 1,
        height: 30,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 16,
        opacity: 0.5,
    },
    label: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    footerValue: {
        fontSize: 14,
        fontWeight: '700',
    },
});
