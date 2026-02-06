import { Container } from '@/components/Container';
import { TransactionItem } from '@/components/TransactionItem';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function IncomesScreen() {
    const { summary, isLoading, refetch } = useFinanceData('month');
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
                        {t('common.loading')}
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
        flex: 1,
    },
    headerContent: {
        marginBottom: 24,
    },
    mobileHeader: {
        marginBottom: 32,
        paddingTop: 8,
    },
    mobileTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: -1.5,
    },
    mobileSubtitle: {
        fontSize: 16,
        color: '#94A3B8',
        fontWeight: '500',
        marginTop: 4,
    },
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 24,
        letterSpacing: -1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    listTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    listContent: {
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        gap: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
        textAlign: 'center',
    },
});
