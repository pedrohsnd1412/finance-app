import { SummaryCard } from '@/components/cards/SummaryCard';
import { Container } from '@/components/Container';
import { PeriodFilter } from '@/components/PeriodFilter';
import { TransactionItem } from '@/components/TransactionItem';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Period } from '@/types/home.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function IncomesScreen() {
    const [period, setPeriod] = useState<Period>('month');
    const { summary, isLoading, refetch } = useFinanceData(period);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const incomesList = useMemo(() => {
        return summary.transactions
            .filter(t => t.type === 'income')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [summary.transactions]);

    const { isDesktop } = useResponsive();
    const { t } = useTranslation();

    const renderHeader = () => (
        <View style={styles.headerContent}>
            {!isDesktop ? (
                <View style={styles.mobileHeader}>
                    <Text style={styles.mobileTitle}>{t('home.stats.income')}</Text>
                    <Text style={styles.mobileSubtitle}>Acompanhe todas as suas entradas</Text>
                </View>
            ) : (
                <Text style={[styles.desktopTitle, { color: theme.text }]}>
                    {t('home.stats.income')}
                </Text>
            )}

            <View style={styles.filterContainer}>
                <PeriodFilter selected={period} onChange={setPeriod} />
            </View>

            <View style={styles.summaryContainer}>
                <SummaryCard
                    income={summary.incomeTotal}
                    expense={summary.expenseTotal}
                />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.listTitle}>Histórico de Entradas</Text>
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="filter-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Container style={styles.container}>
            {isLoading && incomesList.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                    <Text style={[styles.loadingText, { color: '#94A3B8' }]}>
                        {t('home.loading')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={incomesList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <TransactionItem transaction={item} />}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onRefresh={refetch}
                    refreshing={isLoading}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="stats-chart-outline" size={64} color="#94A3B8" style={{ opacity: 0.2 }} />
                            <Text style={styles.emptyText}>
                                Nenhuma receita encontrada neste período.
                            </Text>
                        </View>
                    }
                />
            )}
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 0,
    },
    mobileHeader: {
        paddingHorizontal: 16,
        marginBottom: 32,
        marginTop: 8,
    },
    mobileTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    mobileSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
        marginTop: 2,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        paddingTop: 100,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '600',
    },
    listContent: {
        paddingBottom: 40,
    },
    headerContent: {
        paddingBottom: 16,
    },
    filterContainer: {
        marginBottom: 24,
    },
    summaryContainer: {
        paddingHorizontal: 16,
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    listTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
        gap: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
    },
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginHorizontal: 16,
        marginBottom: 24,
        marginTop: 8,
    },
});
