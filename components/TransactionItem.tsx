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
        if (isIncome) return 'bag-outline';
        const category = transaction.category?.toLowerCase() || '';
        if (category.includes('alimentação') || category.includes('food')) return 'restaurant-outline';
        return 'bag-outline';
    };

    return (
        <View style={StyleSheet.flatten([styles.container, style])}>
            <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons
                    name={getIcon() as any}
                    size={22}
                    color="#6366F1"
                />
            </View>
            <View style={styles.info}>
                <Text style={[styles.desc, { color: '#0F172A' }]} numberOfLines={1}>
                    {transaction.description}
                </Text>
                <Text style={[styles.subText, { color: '#64748B' }]}>
                    {transaction.category || t('common.categories.other')}
                </Text>
            </View>
            <View style={styles.right}>
                <Text style={[
                    styles.val,
                    { color: isIncome ? theme.success : '#EF4444' }
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
        paddingVertical: 12,
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    info: {
        flex: 1,
        gap: 2,
    },
    desc: {
        fontSize: 16,
        fontWeight: '700',
    },
    subText: {
        fontSize: 13,
        fontWeight: '500',
    },
    right: {
        gap: 2,
    },
    val: {
        fontSize: 16,
        fontWeight: '700',
    },
});
