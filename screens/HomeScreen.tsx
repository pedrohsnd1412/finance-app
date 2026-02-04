import AccountsList from '@/components/AccountsList';
import { BalanceCard } from '@/components/cards/BalanceCard';
import { SummaryCard } from '@/components/cards/SummaryCard';
import { DonutChart } from '@/components/charts/DonutChart';
import { Container } from '@/components/Container';
import { PeriodFilter } from '@/components/PeriodFilter';
import { Section } from '@/components/Section';
import { TransactionItem } from '@/components/TransactionItem';
import { TransactionTypeSelector } from '@/components/TransactionTypeSelector';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Period, TransactionTypeFilter } from '@/types/home.types';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

// Category colors for chart
const CATEGORY_COLORS: Record<string, string> = {
    'Alimentação': '#F87171',
    'Transporte': '#60A5FA',
    'Saúde': '#34D399',
    'Educação': '#818CF8',
    'Entretenimento': '#F472B6',
    'Contas': '#FBBF24',
    'Compras': '#A78BFA',
    'Viagem': '#2DD4BF',
    'Moradia': '#FB923C',
    'Trabalho': '#94A3B8',
    'Investimentos': '#4ADE80',
    'Transferência': '#C084FC',
    'Outros': '#94A3B8',
};

export default function HomeScreen() {
    const { t } = useTranslation();
    const [period, setPeriod] = useState<Period>('month');
    const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('all');
    const { summary, isLoading, refetch } = useFinanceData(period, typeFilter);
    const { isDesktop, isTablet } = useResponsive();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleConnectSuccess = (itemData: any) => {
        setShowConnectModal(false);
        Alert.alert('Sucesso', 'Conta conectada com sucesso!');
        refetch(); // Refresh dashboard data
    };

    const handleConnectError = (error: any) => {
        // Modal handles alert, we just close or log
        console.error("Connect error:", error);
        // Don't close immediately so user can see error in widget if handled there, 
        // but PluggyConnect calls onError then onClose usually.
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('home.greetings.morning');
        if (hour < 18) return t('home.greetings.afternoon');
        return t('home.greetings.evening');
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
            <View style={styles.headerRow}>
                <View>
                    <Text style={[styles.greeting, { color: theme.muted }]}>{getGreeting()}</Text>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>{t('home.overview')}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {filterPosition === 'header' && (
                        <View style={styles.headerFilters}>
                            <PeriodFilter
                                selected={period}
                                onChange={setPeriod}
                                style={styles.headerFilter}
                            />
                        </View>
                    )}
                </View>
            </View>

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
                    <View style={styles.filtersMobile}>
                        <PeriodFilter
                            selected={period}
                            onChange={setPeriod}
                        />
                    </View>
                )}

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.tint} />
                        <Text style={StyleSheet.flatten([styles.loadingText, { color: theme.text }])}>
                            {t('home.loading')}
                        </Text>
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

                        {/* Connected Accounts List */}
                        <Section title="Minhas Contas">
                            <AccountsList />
                        </Section>

                        {/* Desktop/Tablet/Mobile Content */}
                        {isDesktop ? (
                            <View style={styles.desktopContent}>
                                {/* Category Chart */}
                                <View style={StyleSheet.flatten([styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }])}>
                                    <Text style={StyleSheet.flatten([styles.chartTitle, { color: theme.text }])}>
                                        {t('home.categoryChart')}
                                    </Text>
                                    <DonutChart data={categoryData} size={180} />
                                </View>

                                {/* Transactions Column */}
                                <View style={styles.transactionsDesktop}>
                                    {/* Type Filter on Top of Transactions */}
                                    <View style={styles.typeSelectorContainer}>
                                        <TransactionTypeSelector
                                            selected={typeFilter}
                                            onChange={setTypeFilter}
                                        />
                                    </View>
                                    <Section title={t('home.transactions')}>
                                        {renderTransactions()}
                                    </Section>
                                </View>
                            </View>
                        ) : (
                            <>
                                {/* Category Chart - Mobile/Tablet */}
                                {categoryData.length > 0 && (
                                    <Section title={t('home.categoryChart')}>
                                        <View style={StyleSheet.flatten([styles.chartContainer, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }])}>
                                            <DonutChart data={categoryData} size={140} />
                                        </View>
                                    </Section>
                                )}

                                {/* Type Filter Above Transactions */}
                                <View style={styles.typeSelectorContainer}>
                                    <TransactionTypeSelector
                                        selected={typeFilter}
                                        onChange={setTypeFilter}
                                    />
                                </View>

                                {/* Transactions */}
                                <Section title={t('home.transactions')}>
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
                                        {t('home.stats.transactions')}
                                    </Text>
                                </View>
                                <View style={StyleSheet.flatten([styles.statCard, { backgroundColor: theme.card }])}>
                                    <Text style={StyleSheet.flatten([styles.statValue, { color: theme.success }])}>
                                        {summary.transactions.filter(t => t.type === 'income').length}
                                    </Text>
                                    <Text style={StyleSheet.flatten([styles.statLabel, { color: theme.text, opacity: 0.6 }])}>
                                        {t('home.stats.income')}
                                    </Text>
                                </View>
                                <View style={StyleSheet.flatten([styles.statCard, { backgroundColor: theme.card }])}>
                                    <Text style={StyleSheet.flatten([styles.statValue, { color: theme.error }])}>
                                        {summary.transactions.filter(t => t.type === 'expense').length}
                                    </Text>
                                    <Text style={StyleSheet.flatten([styles.statLabel, { color: theme.text, opacity: 0.6 }])}>
                                        {t('home.stats.expense')}
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
                        {t('home.emptyTransactions')}
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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingVertical: 16,
        marginBottom: 8,
    },
    greeting: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    headerFilters: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    headerFilter: {
        minWidth: 200,
    },
    filtersMobile: {
        marginBottom: 20,
    },
    typeSelectorContainer: {
        marginBottom: 16,
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
});
