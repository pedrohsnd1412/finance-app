import { Container } from '@/components/Container';
import { GlassCard } from '@/components/GlassCard';
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

export default function ExpensesScreen() {
    const { t } = useTranslation();
    const [period, setPeriod] = useState<Period>('month');
    const { summary, isLoading, refetch } = useFinanceData(period);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { isDesktop } = useResponsive();

    const expensesList = useMemo(() => {
        return summary.transactions
            .filter(t => t.type === 'expense')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [summary.transactions]);

    const renderHeader = () => (
        <View style={styles.headerArea}>
            <View style={styles.titleSection}>
                <Text style={[styles.pageTitle, { color: theme.text }]}>{t('tabs.expenses')}</Text>
                <Text style={styles.pageSubtitle}>Expense history and analysis</Text>
            </View>

            <View style={[styles.periodSwitcher, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {['week', 'month', 'all'].map((p) => (
                    <TouchableOpacity
                        key={p}
                        onPress={() => setPeriod(p as Period)}
                        style={[
                            styles.periodBtn,
                            period === p && [styles.periodBtnActive, { backgroundColor: theme.text }]
                        ]}
                    >
                        <Text style={[
                            styles.periodBtnText,
                            period === p && styles.periodBtnTextActive
                        ]}>
                            {p === 'week' ? '7D' : p === 'month' ? t('common.period.month') : t('common.period.total')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <GlassCard style={styles.summaryHighlight}>
                <View style={styles.summaryTop}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}>
                        <Ionicons name="arrow-up" size={20} color="#F43F5E" />
                    </View>
                    <Text style={styles.summaryLabel}>Total Spent</Text>
                </View>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                    R$ {summary.expenseTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
            </GlassCard>

            <View style={styles.listHeaderSection}>
                <Text style={styles.sectionTitle}>Expense History</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="search-outline" size={18} color="#94A3B8" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Container scrollEnabled={false}>
            {isLoading && expensesList.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>Fetching data...</Text>
                </View>
            ) : (
                <FlatList
                    data={expensesList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <TransactionItem
                            transaction={item}
                            hideBorder={index === expensesList.length - 1}
                        />
                    )}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    onRefresh={refetch}
                    refreshing={isLoading}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={48} color="rgba(255,255,255,0.05)" />
                            <Text style={styles.emptyText}>No expenses found.</Text>
                        </View>
                    }
                />
            )}
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 40,
    },
    headerArea: {
        marginBottom: 24,
    },
    titleSection: {
        marginTop: 40, // Increased from 8
        marginBottom: 28,
    },
    pageTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    pageSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
        marginTop: 4,
    },
    periodSwitcher: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 14,
        padding: 4,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 24,
    },
    periodBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
    },
    periodBtnActive: {
        backgroundColor: '#FFFFFF',
    },
    periodBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
    },
    periodBtnTextActive: {
        color: '#000000',
    },
    summaryHighlight: {
        padding: 24,
        marginBottom: 32,
    },
    summaryTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summaryValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -0.5,
    },
    listHeaderSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    loadingText: {
        color: '#94A3B8',
        marginTop: 12,
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyText: {
        color: '#64748B',
        fontSize: 14,
        marginTop: 12,
        fontWeight: '600',
    },
});
