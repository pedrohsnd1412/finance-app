import { Container } from '@/components/Container';
import { BalanceOverviewChart } from '@/components/desktop/BalanceOverviewChart';
import { SummaryStatsStack } from '@/components/desktop/SummaryStatsStack';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { useFinanceData } from '@/hooks/useFinanceData';
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
        <Container>
            {isDesktop && (
                <Text style={[styles.desktopTitle, { color: theme.text }]}>
                    {t('cashflow.title')}
                </Text>
            )}

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

            <View style={[styles.projectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{t('cashflow.projection')}</Text>
                <Text style={[styles.cardDesc, { color: theme.muted }]}>
                    {t('cashflow.onTrack', { amount: '$1,240' })}
                </Text>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 24,
        marginTop: 8,
    },
    grid: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 24,
    },
    chartSection: {
        flex: 2,
    },
    statsSection: {
        flex: 1,
    },
    projectionCard: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        gap: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    cardDesc: {
        fontSize: 15,
        lineHeight: 22,
    },
});
