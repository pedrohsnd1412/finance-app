import { BankSelector } from '@/components/BankSelector';
import { BalanceCard } from '@/components/cards/BalanceCard';
import { DonutChart } from '@/components/charts/DonutChart';
import { Container } from '@/components/Container';
import { GlassCard } from '@/components/GlassCard';
import { TransactionItem } from '@/components/TransactionItem';
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
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

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
    const { summary, isLoading } = useFinanceData(period, typeFilter, selectedConnectionId);
    const { isDesktop } = useResponsive();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

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
            {!isDesktop ? (
                /* Mobile Layout */
                <View style={styles.mobileLayout}>
                    {/* Header: Logo and Identity Area */}
                    <View style={styles.mobileHeader}>
                        <View style={styles.logoRow}>
                            <View style={styles.logoCircle}>
                                <Text style={styles.logoText}>Q</Text>
                            </View>
                            <Text style={styles.appName}>Qashflow</Text>
                        </View>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.headerActionIcon}>
                                <Ionicons name="search-outline" size={20} color="#94A3B8" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerActionIcon}>
                                <Ionicons name="notifications-outline" size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Identity & Period Section */}
                    <View style={styles.identitySection}>
                        <View>
                            <Text style={styles.pageTitle}>{t('home.overview')}</Text>
                            <Text style={styles.userGreeting}>{getGreeting()}, {summary.userName || 'User'}</Text>
                        </View>
                        <View style={styles.periodSwitcherMobile}>
                            {['week', 'month'].map((p) => (
                                <TouchableOpacity
                                    key={p}
                                    onPress={() => setPeriod(p as Period)}
                                    style={[
                                        styles.periodBtnMobile,
                                        period === p && styles.periodBtnActiveMobile
                                    ]}
                                >
                                    <Text style={[
                                        styles.periodBtnTextMobile,
                                        period === p && styles.periodBtnTextActiveMobile
                                    ]}>
                                        {p === 'week' ? '7D' : 'Mês'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <BankSelector
                        selectedId={selectedConnectionId}
                        onSelect={setSelectedConnectionId}
                    />

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#6366F1" />
                            <Text style={styles.loadingText}>Sincronizando dados...</Text>
                        </View>
                    ) : (
                        <View style={styles.scrollContent}>
                            {/* Key Highlights */}
                            <View style={styles.mainCardsRow}>
                                <BalanceCard
                                    debit={summary.totalDebit}
                                    credit={summary.totalCredit}
                                    style={styles.heroBalanceCard}
                                />
                                <View style={styles.summaryStatsRow}>
                                    <GlassCard style={styles.halfStatCard}>
                                        <Text style={styles.statLabel}>{t('home.stats.income')}</Text>
                                        <Text style={[styles.statValue, { color: '#4ADE80' }]}>
                                            R$ {summary.incomeTotal.toFixed(0)}
                                        </Text>
                                    </GlassCard>
                                    <GlassCard style={styles.halfStatCard}>
                                        <Text style={styles.statLabel}>{t('home.stats.expense')}</Text>
                                        <Text style={[styles.statValue, { color: '#F87171' }]}>
                                            R$ {summary.expenseTotal.toFixed(0)}
                                        </Text>
                                    </GlassCard>
                                </View>
                            </View>

                            {/* Portfolio Evolution (Donut) */}
                            <GlassCard style={styles.chartSectionCard}>
                                <View style={styles.sectionHeaderCompact}>
                                    <Text style={styles.sectionTitlePremium}>Evolução Patrimonial</Text>
                                    <Ionicons name="trending-up" size={18} color="#6366F1" />
                                </View>
                                <View style={styles.chartContainerNative}>
                                    <DonutChart data={creditDebitData} size={150} />
                                    <View style={styles.chartOverlayNative}>
                                        <Text style={styles.overlayLabel}>Patrimônio</Text>
                                        <Text style={styles.overlayValue}>R$ {(summary.totalDebit - summary.totalCredit).toFixed(0)}</Text>
                                    </View>
                                </View>
                            </GlassCard>

                            {/* Recent Activity */}
                            <View style={styles.historySection}>
                                <View style={styles.sectionHeaderCompact}>
                                    <Text style={styles.sectionTitlePremium}>{t('home.recentTransactions')}</Text>
                                    <TouchableOpacity onPress={() => router.push('/expenses')}>
                                        <Text style={styles.viewAllPremium}>{t('home.viewAll')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <GlassCard style={styles.listCardNative}>
                                    {summary.transactions.length > 0 ? (
                                        summary.transactions.slice(0, 5).map((transaction, index) => (
                                            <TransactionItem
                                                key={transaction.id}
                                                transaction={transaction}
                                                hideBorder={index === 4}
                                            />
                                        ))
                                    ) : (
                                        <View style={styles.emptyStateNative}>
                                            <Text style={styles.emptyTextNative}>{t('home.emptyTransactions')}</Text>
                                        </View>
                                    )}
                                </GlassCard>
                            </View>

                            {/* Category Distribution */}
                            {categoryData.length > 0 && (
                                <GlassCard style={[styles.chartSectionCard, { marginTop: 24 }]}>
                                    <View style={styles.sectionHeaderCompact}>
                                        <Text style={styles.sectionTitlePremium}>{t('home.categoryChart')}</Text>
                                        <Ionicons name="pie-chart" size={18} color="#6366F1" />
                                    </View>
                                    <View style={styles.chartContainerNative}>
                                        <DonutChart data={categoryData} size={150} />
                                    </View>
                                </GlassCard>
                            )}
                        </View>
                    )}
                </View>
            ) : (
                /* Desktop Dashboard - Fallback to keep existing logic but simplify */
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                    <Text style={{ color: theme.muted, marginTop: 12 }}>{t('common.loading')}</Text>
                </View>
            )}
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mobileLayout: {
        flex: 1,
    },
    mobileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 24,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    logoCircle: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 18,
    },
    appName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerActionIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    identitySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 32,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    userGreeting: {
        fontSize: 13,
        fontWeight: '600',
        color: '#94A3B8',
        marginTop: 2,
    },
    periodSwitcherMobile: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 14,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    periodBtnMobile: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    periodBtnActiveMobile: {
        backgroundColor: '#FFFFFF',
    },
    periodBtnTextMobile: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
    },
    periodBtnTextActiveMobile: {
        color: '#000000',
    },
    scrollContent: {
        paddingTop: 12,
        paddingBottom: 40,
    },
    mainCardsRow: {
        gap: 20,
        marginBottom: 24,
    },
    heroBalanceCard: {
        width: '100%',
        height: 130,
    },
    summaryStatsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    halfStatCard: {
        flex: 1,
        padding: 14,
        borderRadius: 24,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    chartSectionCard: {
        padding: 24,
        marginBottom: 24,
    },
    sectionHeaderCompact: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitlePremium: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    chartContainerNative: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        position: 'relative',
    },
    chartOverlayNative: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlayLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#64748B',
        textTransform: 'uppercase',
    },
    overlayValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    historySection: {
        marginTop: 8,
    },
    viewAllPremium: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6366F1',
    },
    listCardNative: {
        padding: 0,
        paddingHorizontal: 8,
    },
    emptyStateNative: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyTextNative: {
        color: '#64748B',
        fontSize: 13,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    loadingText: {
        color: '#64748B',
        marginTop: 12,
        fontSize: 14,
        fontWeight: '600',
    },
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 24,
        marginTop: 8,
    },
});
