import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface BalanceCardProps {
    debit: number;
    credit: number;
    style?: ViewStyle;
}

export function BalanceCard({ debit, credit, style }: BalanceCardProps) {
    const { t, i18n } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const formatCurrency = (value: number): string => {
        return value.toLocaleString(i18n.language === 'pt' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: i18n.language === 'pt' ? 'BRL' : 'USD',
        });
    };

    // Mock progress for UI match
    const progress = 0.65;

    return (
        <View style={StyleSheet.flatten([styles.card, { backgroundColor: theme.premiumCard }, style])}>
            <View style={styles.topRow}>
                <Text style={styles.balanceAmount}>
                    {formatCurrency(debit)}
                </Text>
                <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>{t('home.balance')}</Text>

            <View style={styles.progressWrapper}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
            </View>

            <View style={styles.bottomRow}>
                <Text style={styles.cardNumber}>**** **** 302</Text>
                <View style={styles.cardBrand}>
                    <View style={[styles.brandCircle, { backgroundColor: '#EB001B', marginRight: -8 }]} />
                    <View style={[styles.brandCircle, { backgroundColor: '#F79E1B', opacity: 0.8 }]} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 28,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    balanceAmount: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    moreButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 24,
    },
    progressWrapper: {
        marginBottom: 24,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#F79E1B',
        borderRadius: 3,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    cardNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
        letterSpacing: 1,
    },
    cardBrand: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
    },
});
