import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
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
        <View style={StyleSheet.flatten([styles.card, { backgroundColor: theme.card }, style])}>
            <View style={styles.row}>
                <View style={styles.column}>
                    <Text style={StyleSheet.flatten([styles.label, { color: theme.text, opacity: 0.7 }])}>
                        Receitas
                    </Text>
                    <Text style={StyleSheet.flatten([styles.value, { color: theme.success }])}>
                        +{formatCurrency(income)}
                    </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.column}>
                    <Text style={StyleSheet.flatten([styles.label, { color: theme.text, opacity: 0.7 }])}>
                        Despesas
                    </Text>
                    <Text style={StyleSheet.flatten([styles.value, { color: theme.error }])}>
                        -{formatCurrency(expense)}
                    </Text>
                </View>
            </View>
            <View style={StyleSheet.flatten([styles.footer, { borderTopColor: theme.border }])}>
                <Text style={StyleSheet.flatten([styles.footerLabel, { color: theme.text, opacity: 0.6 }])}>
                    Balanço do período
                </Text>
                <Text style={StyleSheet.flatten([styles.footerValue, { color: isPositive ? theme.success : theme.error }])}>
                    {isPositive ? '+' : ''}{formatCurrency(difference)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    column: {
        flex: 1,
    },
    divider: {
        width: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 6,
    },
    value: {
        fontSize: 18,
        fontWeight: '600',
    },
    footer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 13,
    },
    footerValue: {
        fontSize: 16,
        fontWeight: '600',
    },
});
