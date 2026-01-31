import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
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
        <View style={StyleSheet.flatten([styles.card, { backgroundColor: theme.tint }, style])}>
            <View style={styles.header}>
                <Text style={styles.label}>Saldo Total</Text>
                <Ionicons name="wallet-outline" size={20} color="rgba(255, 255, 255, 0.8)" />
            </View>
            <Text style={styles.balance}>
                {formatCurrency(balance)}
            </Text>
            <View style={styles.footer}>
                <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: '#FFF' }]} />
                    <Text style={styles.statusText}>Atualizado agora</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 24,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    balance: {
        fontSize: 34,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -1,
        marginBottom: 20,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 6,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
