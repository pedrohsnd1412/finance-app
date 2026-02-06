import AccountsList from '@/components/AccountsList';
import { BankSelector } from '@/components/BankSelector';
import { BalanceCard } from '@/components/cards/BalanceCard';
import { SummaryCard } from '@/components/cards/SummaryCard';
import { DonutChart } from '@/components/charts/DonutChart';
import { Container } from '@/components/Container';
import { BalanceOverviewChart } from '@/components/desktop/BalanceOverviewChart';
import { SummaryStatsStack } from '@/components/desktop/SummaryStatsStack';
import { Section } from '@/components/Section';
import { TransactionItem } from '@/components/TransactionItem';
import { TransactionTypeSelector } from '@/components/TransactionTypeSelector';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Period, TransactionTypeFilter } from '@/types/home.types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
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
    const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
    const { summary, isLoading, refetch } = useFinanceData(period, typeFilter, selectedConnectionId);
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

    // Calculate Credit vs Debit
    const creditDebitData = React.useMemo(() => {
        return [
            { name: 'Crédito', value: summary.totalCredit * 100, color: '#F43F5E' },
            { name: 'Débito', value: (summary.totalDebit - summary.totalCredit) * 100, color: '#6366F1' },
        ];
    }, [summary.totalCredit, summary.totalDebit]);

    return (
        <Container>
            {isDesktop && (
                <Text style={[styles.desktopTitle, { color: theme.text }]}>
                    {t('tabs.home')}
                </Text>
            )}
            {!isDesktop ? (
                /* Mobile Layout */
                <View style={styles.mobileLayout}>
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.userName}>
                                {t('home.overview')}
                            </Text>
                            <Text style={styles.greeting}>{getGreeting()}, {summary.userName || 'User'}</Text>
                        </View>
                        <TouchableOpacity style={styles.notificationIcon}>
                            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    <BankSelector
                        selectedId={selectedConnectionId}
                        onSelect={setSelectedConnectionId}
                    />

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={theme.tint} />
                        </View>
                    ) : (
                        <View style={styles.scrollContent}>
                            <View style={styles.cardsSection}>
                                <BalanceCard
                                    debit={summary.totalDebit}
                                    credit={summary.totalCredit}
                                    style={styles.fullWidthCard}
                                />
                                <SummaryCard
                                    income={summary.incomeTotal}
                                    expense={summary.expenseTotal}
                                    style={styles.fullWidthCard}
                                />
                            </View>

                            <View style={styles.typeSelectorContainer}>
                                <TransactionTypeSelector
                                    selected={typeFilter}
                                    onChange={setTypeFilter}
                                />
                            </View>

                            <Section title="Evolução Patrimonial">
                                <View style={styles.chartWrapper}>
                                    <DonutChart data={creditDebitData} size={180} />
                                </View>
                            </Section>

                            <Section
                                title={t('home.recentTransactions')}
                                action={
                                    <TouchableOpacity>
                                        <Text style={styles.viewAll}>{t('home.viewAll')}</Text>
                                    </TouchableOpacity>
                                }
                            >
                                <View style={styles.listContainer}>
                                    {summary.transactions.length > 0 ? (
                                        summary.transactions.slice(0, 5).map((transaction) => (
                                            <TransactionItem
                                                key={transaction.id}
                                                transaction={transaction}
                                            />
                                        ))
                                    ) : (
                                        <View style={styles.emptyState}>
                                            <Text style={styles.emptyText}>
                                                {t('home.emptyTransactions')}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </Section>

                            {categoryData.length > 0 && (
                                <Section title={t('home.categoryChart')}>
                                    <View style={styles.chartWrapper}>
                                        <DonutChart data={categoryData} size={180} />
                                    </View>
                                </Section>
                            )}

                            <Section title={t('tabs.banks')}>
                                <AccountsList filter={typeFilter} />
                            </Section>
                        </View>
                    )}
                </View>
            ) : (
                /* Desktop Dashboard Grid */
                isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.tint} />
                    </View>
                ) : (
                    <View style={styles.desktopGrid}>
                        {/* Column 1: Main Stats & Charts */}
                        <View style={styles.gridColMain}>
                            <View style={styles.gridRowTop}>
                                <View style={styles.chartCol}>
                                    <BalanceOverviewChart />
                                </View>
                                <View style={styles.statsCol}>
                                    <SummaryStatsStack
                                        income={summary.incomeTotal}
                                        expense={summary.expenseTotal}
                                        saved={summary.totalBalance}
                                    />
                                </View>
                            </View>

                            {/* Moved Transaction History here for cleaner layout */}
                            <View style={[styles.genericCard, { backgroundColor: theme.card, marginTop: 24 }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                                        {t('home.recentTransactions')}
                                    </Text>
                                    <TouchableOpacity>
                                        <Text style={[styles.viewAll, { color: theme.tint }]}>{t('home.viewAll')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.transactionList}>
                                    {summary.transactions.slice(0, 10).map(tx => (
                                        <TransactionItem key={tx.id} transaction={tx} />
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Column 2: Simplified Cards Column */}
                        <View style={styles.gridColSide}>
                            <View style={[styles.genericCard, { backgroundColor: theme.card }]}>
                                <View style={styles.cardHeader}>
                                    <Text style={[styles.cardTitle, { color: theme.text }]}>{t('home.myCard')}</Text>
                                </View>

                                <BalanceCard
                                    debit={summary.totalDebit}
                                    credit={summary.totalCredit}
                                    style={styles.desktopBalanceCard}
                                />

                                {/* Tips or small info could stay if requested, but removing based on "clean" request */}
                                <View style={{ marginTop: 20 }}>
                                    <Text style={[styles.cardSubtitle, { color: theme.muted, fontSize: 13 }]}>
                                        {t('home.premiumTips')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )
            )}
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mobileLayout: {
        paddingTop: 8,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        paddingHorizontal: 4,
    },
    greeting: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    userName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        marginTop: 4,
        letterSpacing: -1,
    },
    notificationIcon: {
        width: 52,
        height: 52,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardsSection: {
        gap: 20,
        marginBottom: 32,
    },
    fullWidthCard: {
        width: '100%',
    },
    typeSelectorContainer: {
        marginBottom: 24,
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6366F1',
    },
    listContainer: {
        gap: 0, // TransactionItems have their own padding
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    chartWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
    },
    // Desktop Grid Styles
    desktopGrid: {
        flexDirection: 'row',
        gap: 24,
        marginTop: 8,
    },
    gridColMain: {
        flex: 2,
        gap: 24,
    },
    gridColSide: {
        flex: 1,
        gap: 24,
    },
    gridRowTop: {
        flexDirection: 'row',
        gap: 24,
    },
    chartCol: {
        flex: 2,
    },
    statsCol: {
        flex: 1,
    },
    gridRowMiddle: {
        flexDirection: 'row',
        gap: 24,
    },
    spendingLimitCol: {
        flex: 1,
    },
    tipsCol: {
        flex: 1,
    },
    gridRowBottom: {
        flexDirection: 'row',
        gap: 24,
    },
    costAnalysisCol: {
        flex: 1,
    },
    healthCol: {
        flex: 1,
    },
    goalCol: {
        flex: 1,
    },
    genericCard: {
        borderRadius: 24,
        padding: 24,
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    cardSubtitle: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardDesc: {
        fontSize: 13,
        lineHeight: 18,
        marginVertical: 12,
    },
    readMore: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readMoreText: {
        fontSize: 13,
        fontWeight: '700',
    },
    progressRow: {
        marginVertical: 16,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    valRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    valText: {
        fontSize: 20,
        fontWeight: '800',
    },
    targetText: {
        fontSize: 12,
        fontWeight: '600',
    },
    dashAmount: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 16,
    },
    miniBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
        height: 40,
        marginBottom: 20,
    },
    miniBar: {
        width: 12,
        borderRadius: 4,
    },
    legendGrid: {
        gap: 8,
    },
    legItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },
    desktopBalanceCard: {
        height: 180,
    },
    addCardBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addCardText: {
        fontSize: 13,
        fontWeight: '600',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cardActionItem: {
        alignItems: 'center',
        gap: 8,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontSize: 10,
        fontWeight: '700',
    },
    transactionList: {
        gap: 8,
    },
    periodToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    periodText: {
        fontSize: 12,
        fontWeight: '600',
    },
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 24,
        marginTop: 8,
    },
});
