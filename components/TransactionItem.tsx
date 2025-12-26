import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Transaction } from '@/types/home.types';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface TransactionItemProps {
    transaction: Transaction;
    style?: ViewStyle;
}

export function TransactionItem({ transaction, style }: TransactionItemProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const isIncome = transaction.type === 'income';

    const formatCurrency = (value: number): string => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hoje';
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Ontem';
        }
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    return (
        <View style={StyleSheet.flatten([styles.container, { borderBottomColor: theme.border }, style])}>
            <View style={styles.iconContainer}>
                <View style={StyleSheet.flatten([
                    styles.iconCircle,
                    { backgroundColor: isIncome ? `${theme.success}20` : `${theme.error}20` }
                ])}>
                    <Text style={StyleSheet.flatten([
                        styles.iconText,
                        { color: isIncome ? theme.success : theme.error }
                    ])}>
                        {isIncome ? '↓' : '↑'}
                    </Text>
                </View>
            </View>
            <View style={styles.content}>
                <Text style={StyleSheet.flatten([styles.description, { color: theme.text }])} numberOfLines={1}>
                    {transaction.description}
                </Text>
                <Text style={StyleSheet.flatten([styles.category, { color: theme.text, opacity: 0.5 }])}>
                    {transaction.category || 'Outros'} • {formatDate(transaction.date)}
                </Text>
            </View>
            <Text style={StyleSheet.flatten([
                styles.amount,
                { color: isIncome ? theme.success : theme.error }
            ])}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    iconContainer: {
        marginRight: 12,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    description: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 2,
    },
    category: {
        fontSize: 12,
    },
    amount: {
        fontSize: 15,
        fontWeight: '600',
        marginLeft: 8,
    },
});
