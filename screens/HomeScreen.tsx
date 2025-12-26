import { BalanceCard } from '@/components/cards/BalanceCard';
import { SummaryCard } from '@/components/cards/SummaryCard';
import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { PeriodFilter } from '@/components/PeriodFilter';
import { Section } from '@/components/Section';
import { TransactionItem } from '@/components/TransactionItem';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { usePeriodFilter } from '@/hooks/usePeriodFilter';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
    const { period, setPeriod, summary } = usePeriodFilter('month');
    const { isDesktop, isTablet, isMobile } = useResponsive();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Responsive layout helpers
    const cardContainerStyle = isDesktop
        ? styles.cardsRow
        : isTablet
            ? styles.cardsRowTablet
            : styles.cardsColumn;

    const filterPosition = isDesktop ? 'header' : 'content';

    return (
        <Container>
            <Header
                title="Resumo"
                rightElement={filterPosition === 'header' ? (
                    <PeriodFilter
                        selected={period}
                        onChange={setPeriod}
                        style={styles.headerFilter}
                    />
                ) : undefined}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Period Filter - Mobile/Tablet */}
                {filterPosition === 'content' && (
                    <PeriodFilter
                        selected={period}
                        onChange={setPeriod}
                        style={styles.filterMobile}
                    />
                )}

                {/* Balance & Summary Cards */}
                <View style={cardContainerStyle}>
                    <BalanceCard
                        balance={summary.totalBalance}
                        style={isDesktop || isTablet ? styles.cardHalf : styles.cardFull}
                    />
                    <SummaryCard
                        income={summary.incomeTotal}
                        expense={summary.expenseTotal}
                        style={isDesktop || isTablet ? styles.cardHalf : styles.cardFull}
                    />
                </View>

                {/* Transactions Section */}
                <Section title="Movimentações Recentes">
                    {summary.transactions.length > 0 ? (
                        summary.transactions.slice(0, 10).map((transaction, index) => (
                            <TransactionItem
                                key={transaction.id}
                                transaction={transaction}
                                style={index === Math.min(summary.transactions.length - 1, 9)
                                    ? styles.lastTransaction
                                    : undefined}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={StyleSheet.flatten([styles.emptyText, { color: theme.text, opacity: 0.5 }])}>
                                Nenhuma movimentação neste período.
                            </Text>
                        </View>
                    )}
                </Section>

                {/* Quick Stats for Desktop */}
                {isDesktop && summary.transactions.length > 0 && (
                    <View style={styles.statsRow}>
                        <View style={StyleSheet.flatten([styles.statCard, { backgroundColor: theme.card }])}>
                            <Text style={StyleSheet.flatten([styles.statValue, { color: theme.tint }])}>
                                {summary.transactions.length}
                            </Text>
                            <Text style={StyleSheet.flatten([styles.statLabel, { color: theme.text, opacity: 0.6 }])}>
                                Transações
                            </Text>
                        </View>
                        <View style={StyleSheet.flatten([styles.statCard, { backgroundColor: theme.card }])}>
                            <Text style={StyleSheet.flatten([styles.statValue, { color: theme.success }])}>
                                {summary.transactions.filter(t => t.type === 'income').length}
                            </Text>
                            <Text style={StyleSheet.flatten([styles.statLabel, { color: theme.text, opacity: 0.6 }])}>
                                Entradas
                            </Text>
                        </View>
                        <View style={StyleSheet.flatten([styles.statCard, { backgroundColor: theme.card }])}>
                            <Text style={StyleSheet.flatten([styles.statValue, { color: theme.error }])}>
                                {summary.transactions.filter(t => t.type === 'expense').length}
                            </Text>
                            <Text style={StyleSheet.flatten([styles.statLabel, { color: theme.text, opacity: 0.6 }])}>
                                Saídas
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    headerFilter: {
        minWidth: 240,
    },
    filterMobile: {
        marginBottom: 20,
    },
    // Card layouts
    cardsColumn: {
        flexDirection: 'column',
        gap: 16,
        marginBottom: 24,
    },
    cardsRow: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 24,
    },
    cardsRowTablet: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    cardFull: {
        width: '100%',
    },
    cardHalf: {
        flex: 1,
    },
    // Transactions
    lastTransaction: {
        borderBottomWidth: 0,
    },
    emptyState: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
    },
    // Desktop stats
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    statCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
});
