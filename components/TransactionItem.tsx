import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Transaction } from '@/types/home.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface TransactionItemProps {
    transaction: Transaction;
    style?: ViewStyle;
}

export function TransactionItem({ transaction, style }: TransactionItemProps) {
    const { t, i18n } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const isIncome = transaction.type === 'income';

    const formatCurrency = (value: number): string => {
        return value.toLocaleString(i18n.language === 'pt' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: i18n.language === 'pt' ? 'BRL' : 'USD',
        });
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString(i18n.language === 'pt' ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getIcon = () => {
        const category = transaction.category?.toLowerCase() || '';
        if (category.includes('alimentação') || category.includes('food')) return 'restaurant-outline';
        if (category.includes('compras') || category.includes('shopping')) return 'cart-outline';
        if (category.includes('transporte') || category.includes('transport')) return 'car-outline';
        if (category.includes('saúde') || category.includes('health')) return 'medkit-outline';
        if (category.includes('entretenimento') || category.includes('entertainment')) return 'game-controller-outline';
        return isIncome ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline';
    };

    return (
        <View style={StyleSheet.flatten([styles.container, style])}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                <Ionicons
                    name={getIcon() as any}
                    size={22}
                    color={isIncome ? '#10B981' : '#F43F5E'}
                />
            </View>
            <View style={styles.info}>
                <Text style={[styles.desc, { color: '#FFFFFF' }]} numberOfLines={1}>
                    {transaction.description}
                </Text>
                <Text style={[styles.subText, { color: '#94A3B8' }]}>
                    {transaction.category || t('common.categories.other')}
                </Text>
            </View>
            <View style={styles.right}>
                <Text style={[
                    styles.val,
                    { color: isIncome ? '#10B981' : '#FFFFFF' }
                ]}>
                    {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                </Text>
                <Text style={[styles.subText, { textAlign: 'right', color: '#64748B' }]}>
                    {formatDate(transaction.date)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    info: {
        flex: 1,
        gap: 2,
    },
    desc: {
        fontSize: 15,
        fontWeight: '700',
    },
    subText: {
        fontSize: 12,
        fontWeight: '600',
    },
    right: {
        gap: 2,
    },
    val: {
        fontSize: 16,
        fontWeight: '800',
    },
});
