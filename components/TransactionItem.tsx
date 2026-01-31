import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Transaction } from '@/types/home.types';
import { Ionicons } from '@expo/vector-icons';
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

    const getIcon = () => {
        if (isIncome) return 'add-outline';
        const category = transaction.category?.toLowerCase() || '';
        if (category.includes('alimentação') || category.includes('restaurante')) return 'restaurant-outline';
        if (category.includes('transporte') || category.includes('uber')) return 'car-outline';
        if (category.includes('saúde') || category.includes('farmácia')) return 'medkit-outline';
        if (category.includes('moradia') || category.includes('aluguel')) return 'home-outline';
        if (category.includes('entretenimento')) return 'film-outline';
        if (category.includes('contas')) return 'receipt-outline';
        return 'cart-outline';
    };

    return (
        <View style={StyleSheet.flatten([styles.container, { borderBottomColor: theme.border }, style])}>
            <View style={[styles.iconContainer, { backgroundColor: isIncome ? theme.success + '10' : theme.background }]}>
                <Ionicons
                    name={getIcon() as any}
                    size={20}
                    color={isIncome ? theme.success : theme.muted}
                />
            </View>
            <View style={styles.content}>
                <Text style={[styles.description, { color: theme.text }]} numberOfLines={1}>
                    {transaction.description}
                </Text>
                <Text style={[styles.category, { color: theme.muted }]}>
                    {transaction.category || 'Outros'} • {formatDate(transaction.date)}
                </Text>
            </View>
            <Text style={[
                styles.amount,
                { color: isIncome ? theme.success : theme.text }
            ]}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    content: {
        flex: 1,
        gap: 2,
    },
    description: {
        fontSize: 15,
        fontWeight: '600',
    },
    category: {
        fontSize: 13,
        fontWeight: '400',
    },
    amount: {
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 12,
    },
});
