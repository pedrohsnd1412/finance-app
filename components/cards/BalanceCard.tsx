import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface BalanceCardProps {
    debit: number;
    credit: number;
    style?: ViewStyle;
}

export function BalanceCard({ debit, credit, style }: BalanceCardProps) {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const formatCurrency = (value: number): string => {
        return 'R$ ' + value.toLocaleString('pt-BR', {
            maximumFractionDigits: 0,
        });
    };

    return (
        <View style={StyleSheet.flatten([styles.card, { backgroundColor: '#6366f1' }, style])}>
            {/* Glossy overlay effect simulation */}
            <View style={styles.glossyOverlay} />

            <View style={styles.content}>
                <View style={styles.topRow}>
                    <View>
                        <Text style={styles.label}>Subtotal</Text>
                        <Text style={styles.balanceAmount}>
                            {formatCurrency(debit - credit)}
                        </Text>
                    </View>
                </View>

                <View style={styles.bottomRow}>
                    <View>
                        <Text style={styles.cardNumber}>**** 4582</Text>
                        <Text style={styles.expiry}>09/28</Text>
                    </View>
                    <View style={styles.cardBrand}>
                        <View style={[styles.brandCircle, { backgroundColor: '#EB001B', marginRight: -8 }]} />
                        <View style={[styles.brandCircle, { backgroundColor: '#F79E1B', opacity: 0.8 }]} />
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 36,
        height: 220,
        overflow: 'hidden',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
    },
    glossyOverlay: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    content: {
        flex: 1,
        padding: 30,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    balanceAmount: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -2,
        marginTop: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.9)',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    cardNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    expiry: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 4,
        textTransform: 'uppercase',
    },
    cardBrand: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
});
