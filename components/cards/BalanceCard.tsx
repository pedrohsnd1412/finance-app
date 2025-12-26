import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface BalanceCardProps {
    balance: number;
    style?: ViewStyle;
}

export function BalanceCard({ balance, style }: BalanceCardProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isPositive = balance >= 0;

    const formatCurrency = (value: number): string => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    return (
        <View style={StyleSheet.flatten([styles.card, { backgroundColor: theme.card }, style])}>
            <Text style={StyleSheet.flatten([styles.label, { color: theme.text, opacity: 0.7 }])}>
                Saldo Total
            </Text>
            <Text
                style={StyleSheet.flatten([
                    styles.balance,
                    { color: isPositive ? theme.success : theme.error }
                ])}
            >
                {formatCurrency(balance)}
            </Text>
            <Text style={StyleSheet.flatten([styles.hint, { color: theme.text, opacity: 0.5 }])}>
                Contas conectadas
            </Text>
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
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    balance: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 4,
    },
    hint: {
        fontSize: 12,
    },
});
