import { Container } from '@/components/Container';
import { GlassCard } from '@/components/GlassCard';
import { BalanceOverviewChart } from '@/components/desktop/BalanceOverviewChart';
import { SummaryStatsStack } from '@/components/desktop/SummaryStatsStack';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export default function CashflowScreen() {
    const { t } = useTranslation();
    const { isDesktop } = useResponsive();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { summary } = useFinanceData('month');

    return (
        <Container style={styles.container}>
            <View style={styles.header}>
                {!isDesktop ? (
                    <View>
                        <Text style={styles.mobileTitle}>{t('cashflow.title')}</Text>
                        <Text style={styles.mobileSubtitle}>{t('cashflow.subtitle')}</Text>
                    </View>
                ) : (
                    <Text style={[styles.desktopTitle, { color: theme.text }]}>
                        {t('cashflow.title')}
                    </Text>
                )}
            </View>

            <View style={styles.grid}>
                <View style={styles.chartSection}>
                    <BalanceOverviewChart />
                </View>

                <View style={styles.statsSection}>
                    <SummaryStatsStack
                        income={summary.incomeTotal}
                        expense={summary.expenseTotal}
                        saved={summary.totalBalance}
                    />
                </View>
            </View>

            <GlassCard style={styles.projectionCard}>
                <View style={styles.projectionHeader}>
                    <Ionicons name="sparkles-outline" size={24} color="#6366F1" />
                    <Text style={styles.cardTitle}>{t('cashflow.projection')}</Text>
                </View>
                <Text style={styles.cardDesc}>
                    {t('cashflow.onTrack', { amount: '$1,240' })}
                </Text>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '65%' }]} />
                </View>
            </GlassCard>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 0,
    },
    header: {
        paddingHorizontal: 16,
        marginBottom: 28,
        marginTop: 8,
    },
    mobileTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    mobileSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
        marginTop: 4,
    },
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 24,
    },
    grid: {
        flexDirection: 'column',
        gap: 32,
        marginBottom: 32,
        paddingHorizontal: 16,
    },
    chartSection: {
        width: '100%',
    },
    statsSection: {
        width: '100%',
    },
    projectionCard: {
        marginHorizontal: 16,
        padding: 24,
        gap: 16,
    },
    projectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    cardDesc: {
        fontSize: 15,
        lineHeight: 22,
        color: '#94A3B8',
        fontWeight: '500',
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#6366F1',
        borderRadius: 3,
    },
});
