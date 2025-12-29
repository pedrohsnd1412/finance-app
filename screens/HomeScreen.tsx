import { BalanceCard } from '@/components/cards/BalanceCard';
import { SummaryCard } from '@/components/cards/SummaryCard';
import { DonutChart } from '@/components/charts/DonutChart';
import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { PeriodFilter } from '@/components/PeriodFilter';
import { Section } from '@/components/Section';
import { TransactionItem } from '@/components/TransactionItem';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Period } from '@/types/home.types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// Category colors for chart
const CATEGORY_COLORS: Record<string, string> = {
    'Alimentação': '#FF6B6B',
    'Transporte': '#4ECDC4',
    'Saúde': '#45B7D1',
    'Educação': '#96CEB4',
    'Entretenimento': '#DDA0DD',
    'Contas': '#FFD93D',
    'Compras': '#6BCB77',
    'Viagem': '#4D96FF',
    'Moradia': '#FF8B94',
    'Trabalho': '#A8E6CF',
    'Investimentos': '#88D8B0',
    'Transferência': '#B4A7D6',
    'Outros': '#9E9E9E',
};

export default function HomeScreen() {
    const [period, setPeriod] = useState<Period>('month');
    const { summary, isLoading, isConnected, hasAccounts, refetch } = useFinanceData(period);
    const { isDesktop, isTablet } = useResponsive();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    // Calculate category distribution for chart
    const categoryData = React.useMemo(() => {
        const expenses = summary.transactions.filter(t => t.type === 'expense');
        const categoryMap: Record<string, number> = {};

        expenses.forEach(tx => {
            const cat = tx.category || 'Outros';
            categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount;
        });

        return Object.entries(categoryMap)
            .map(([name, value]) => ({
                name,
                value: value * 100, // Convert to cents for chart
                color: CATEGORY_COLORS[name] || '#9E9E9E',
            }))
            .sort((a, b) => b.value - a.value);
    }, [summary.transactions]);

    // Responsive layout
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
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Period Filter - Mobile/Tablet */}
                {filterPosition === 'content' && (
                    <PeriodFilter
                        selected={period}
                        onChange={setPeriod}
                        style={styles.filterMobile}
                    />
                )}

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.tint} />
                        <Text style={StyleSheet.flatten([styles.loadingText, { color: theme.text }])}>
                            Carregando dados...
                        </Text>
                    </View>
                ) : !hasAccounts ? (
                    /* Empty State - No accounts connected */
                    <View style={styles.emptyStateContainer}>
                        <View style={StyleSheet.flatten([styles.emptyStateIcon, { backgroundColor: theme.tint + '15' }])}>
                            <Ionicons name="wallet-outline" size={64} color={theme.tint} />
                        </View>
                        <Text style={StyleSheet.flatten([styles.emptyStateTitle, { color: theme.text }])}>
                            Nenhuma conta conectada
                        </Text>
                        <Text style={StyleSheet.flatten([styles.emptyStateSubtitle, { color: theme.text, opacity: 0.6 }])}>
                            Conecte sua conta bancária para visualizar seus dados financeiros em tempo real.
                        </Text>
                        <Pressable
                            style={StyleSheet.flatten([styles.connectButton, { backgroundColor: theme.tint }])}
                            onPress={() => router.push('/connect')}
                        >
                            <Ionicons name="add-circle-outline" size={22} color="#fff" />
                            <Text style={styles.connectButtonText}>Conectar Conta</Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
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

                        {/* Desktop: Side-by-side chart and transactions */}
                        {isDesktop ? (
                            <View style={styles.desktopContent}>
                                {/* Category Chart */}
                                <View style={StyleSheet.flatten([styles.chartCard, { backgroundColor: theme.card }])}>
                                    <Text style={StyleSheet.flatten([styles.chartTitle, { color: theme.text }])}>
                                        Gastos por Categoria
                                    </Text>
                                    <DonutChart data={categoryData} size={180} />
                                </View>

                                {/* Transactions */}
                                <View style={styles.transactionsDesktop}>
                                    <Section title="Movimentações Recentes">
                                        {renderTransactions()}
                                    </Section>
                                </View>
                            </View>
                        ) : (
                            <>
                                {/* Category Chart - Mobile/Tablet */}
                                {categoryData.length > 0 && (
                                    <Section title="Gastos por Categoria">
                                        <View style={StyleSheet.flatten([styles.chartContainer, { backgroundColor: theme.card }])}>
                                            <DonutChart data={categoryData} size={140} />
                                        </View>
                                    </Section>
                                )}

                                {/* Transactions */}
                                <Section title="Movimentações Recentes">
                                    {renderTransactions()}
                                </Section>
                            </>
                        )}

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
                    </>
                )}
            </ScrollView>
        </Container>
    );

    function renderTransactions() {
        if (summary.transactions.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Text style={StyleSheet.flatten([styles.emptyText, { color: theme.text, opacity: 0.5 }])}>
                        Nenhuma movimentação neste período.
                    </Text>
                </View>
            );
        }

        return summary.transactions.slice(0, 10).map((transaction, index) => (
            <TransactionItem
                key={transaction.id}
                transaction={transaction}
                style={index === Math.min(summary.transactions.length - 1, 9)
                    ? styles.lastTransaction
                    : undefined}
            />
        ));
    }
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
    // Loading
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
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
    // Chart
    chartCard: {
        flex: 1,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    chartContainer: {
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    // Desktop layout
    desktopContent: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 24,
    },
    transactionsDesktop: {
        flex: 2,
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
    // Empty State
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 32,
    },
    emptyStateIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyStateTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    connectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
    },
    connectButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
