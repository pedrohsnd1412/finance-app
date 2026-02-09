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

export default function IncomesScreen() {
    const { t } = useTranslation();
    const [period, setPeriod] = useState<Period>('month');
    const { summary, isLoading, refetch } = useFinanceData(period);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { isDesktop } = useResponsive();

    const incomesList = useMemo(() => {
        return summary.transactions
            .filter(t => t.type === 'income')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [summary.transactions]);

    const renderHeader = () => (
        <View style={styles.headerArea}>
            <View style={styles.titleSection}>
                <Text style={styles.pageTitle}>{t('tabs.incomes')}</Text>
                <Text style={styles.pageSubtitle}>Acompanhe suas entradas financeiras</Text>
            </View>

            <View style={styles.periodSwitcher}>
                {['week', 'month', 'all'].map((p) => (
                    <TouchableOpacity
                        key={p}
                        onPress={() => setPeriod(p as Period)}
                        style={[
                            styles.periodBtn,
                            period === p && styles.periodBtnActive
                        ]}
                    >
                        <Text style={[
                            styles.periodBtnText,
                            period === p && styles.periodBtnTextActive
                        ]}>
                            {p === 'week' ? '7D' : p === 'month' ? 'Mês' : 'Total'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <GlassCard style={styles.summaryHighlight}>
                <View style={styles.summaryTop}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="arrow-down" size={20} color="#4ADE80" />
                    </View>
                    <Text style={styles.summaryLabel}>Total Recebido</Text>
                </View>
                <Text style={styles.summaryValue}>
                    R$ {summary.incomeTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Text>
            </GlassCard>

            <View style={styles.listHeaderSection}>
                <Text style={styles.sectionTitle}>Histórico de Transações</Text>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="search-outline" size={18} color="#94A3B8" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Container scrollEnabled={false}>
            {isLoading && incomesList.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.loadingText}>Buscando dados...</Text>
                </View>
            ) : (
                <FlatList
                    data={incomesList}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <TransactionItem
                            transaction={item}
                            hideBorder={index === incomesList.length - 1}
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
                            <Text style={styles.emptyText}>Nenhuma entrada encontrada.</Text>
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
        marginTop: 8,
        marginBottom: 28,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: '900',
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
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
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
        fontWeight: '700',
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
