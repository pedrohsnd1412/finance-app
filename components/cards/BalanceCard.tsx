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
    const { t, i18n } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const formatCurrency = (value: number): string => {
        return value.toLocaleString(i18n.language === 'pt' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: i18n.language === 'pt' ? 'BRL' : 'USD',
            maximumFractionDigits: 0,
        });
    };

    return (
        <View style={StyleSheet.flatten([styles.card, { backgroundColor: '#4338CA' }, style])}>
            {/* Glossy overlay effect simulation */}
            <View style={styles.glossyOverlay} />

            <View style={styles.content}>
                <View style={[styles.topRow, { flexDirection: 'column', gap: 0 }]}>
                    <Text style={styles.headerTitle}>{t('home.myBalance')}</Text>
                    <Text style={styles.headerSubtitle}>{t('home.availableBalance')}</Text>
                </View>

                <View style={{ marginTop: 20 }}>
                    <Text style={styles.label}>{t('home.subtotal')}</Text>
                    <Text style={styles.balanceAmount}>
                        {formatCurrency(debit)}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 32,
        minHeight: 180,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        position: 'relative',
        backgroundColor: '#4338CA',
    },
    glossyOverlay: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 256,
        height: 256,
        borderRadius: 128,
        backgroundColor: '#818CF8',
        opacity: 0.2,
        transform: [{ scale: 1.5 }],
        // blurRadius not directly supported in View, relying on opacity overlap
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
        zIndex: 10,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    balanceAmount: {
        fontSize: 40,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
        marginTop: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        color: '#818cf8', // Indigo-400 equivalent
        textTransform: 'uppercase',
        letterSpacing: 0.5,
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
    headerTitle: {
        fontSize: 24, // Starting to match desktop h4 text-3xl somewhat scaled
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#9CA3AF', // Gray-400
        fontWeight: '500',
        letterSpacing: 0.5,
    }
});
