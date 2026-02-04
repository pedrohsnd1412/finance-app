import { SummaryCard } from '@/components/cards/SummaryCard';
import { DonutChart } from '@/components/charts/DonutChart';
import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { PeriodFilter } from '@/components/PeriodFilter';
import { TransactionItem } from '@/components/TransactionItem';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Period } from '@/types/home.types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

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

export default function ExpensesScreen() {
    const [period, setPeriod] = useState<Period>('month');
    const { summary, isLoading, refetch } = useFinanceData(period);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const expensesList = useMemo(() => {
        return summary.transactions
            .filter(t => t.type === 'expense')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [summary.transactions]);

    const categoryData = useMemo(() => {
        const categoryMap: Record<string, number> = {};

        expensesList.forEach(tx => {
            const cat = tx.category || 'Outros';
            categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount;
        });

        return Object.entries(categoryMap)
            .map(([name, value]) => ({
                name,
                value: value * 100, // Chart expects integer cents or just relative values
                color: CATEGORY_COLORS[name] || '#9E9E9E',
            }))
            .sort((a, b) => b.value - a.value);
    }, [expensesList]);

    const { isDesktop } = useResponsive();
    const { t } = useTranslation();

    const renderHeader = () => (
        <View style={styles.headerContent}>
            {isDesktop && (
                <Text style={[styles.desktopTitle, { color: theme.text }]}>
                    {t('home.transactions')}
                </Text>
            )}
            {/* Period Filter */}
            <View style={styles.filterContainer}>
                <PeriodFilter selected={period} onChange={setPeriod} />
            </View>

            {/* Total Summary */}
            <View style={styles.summaryContainer}>
                <SummaryCard
                    income={summary.incomeTotal}
                    expense={summary.expenseTotal}
                />
            </View>

            {/* Chart */}
            {expensesList.length > 0 && (
                <View style={styles.chartContainer}>
                    <Text style={StyleSheet.flatten([styles.chartTitle, { color: theme.text }])}>
                        Categorias
                    </Text>
                    <DonutChart data={categoryData} />
                </View>
            )}

            {/* List Title */}
            <Text style={StyleSheet.flatten([styles.listTitle, { color: theme.text }])}>
                Histórico
            </Text>
        </View>
    );

    return (
        <Container>
            <Header title="Despesas" />

            {isLoading && expensesList.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                    <Text style={StyleSheet.flatten([styles.loadingText, { color: theme.text }])}>
                        Carregando despesas...
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={expensesList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <TransactionItem transaction={item} />}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onRefresh={refetch}
                    refreshing={isLoading}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={48} color={theme.text} style={{ opacity: 0.3 }} />
                            <Text style={StyleSheet.flatten([styles.emptyText, { color: theme.text, opacity: 0.5 }])}>
                                Nenhuma despesa neste período
                            </Text>
                        </View>
                    }
                />
            )}
        </Container>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
    },
    listContent: {
        paddingBottom: 24,
    },
    headerContent: {
        paddingBottom: 16,
    },
    filterContainer: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    summaryContainer: {
        marginHorizontal: 16,
        marginBottom: 24,
    },
    chartContainer: {
        marginBottom: 24,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginHorizontal: 16,
        marginBottom: 12,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginHorizontal: 16,
        marginBottom: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
    },
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginHorizontal: 16,
        marginBottom: 24,
        marginTop: 8,
    },
});
