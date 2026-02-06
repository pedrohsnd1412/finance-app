import { Container } from '@/components/Container';
import { GlassCard } from '@/components/GlassCard';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BudgetScreen() {
    const { t } = useTranslation();
    const { isDesktop } = useResponsive();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const budgets = [
        { category: t('budget.categories.housing'), spent: 1500, limit: 2000, color: '#FB923C' },
        { category: t('budget.categories.food'), spent: 600, limit: 800, color: '#84CC16' },
        { category: t('budget.categories.transportation'), spent: 300, limit: 500, color: '#10B981' },
        { category: t('budget.categories.entertainment'), spent: 450, limit: 400, color: '#F43F5E' },
    ];

    return (
        <Container style={styles.container}>
            <View style={styles.header}>
                {!isDesktop ? (
                    <View>
                        <Text style={styles.mobileTitle}>{t('budget.title')}</Text>
                        <Text style={styles.mobileSubtitle}>{t('budget.subtitle')}</Text>
                    </View>
                ) : (
                    <Text style={[styles.desktopTitle, { color: theme.text }]}>
                        {t('budget.title')}
                    </Text>
                )}
                <TouchableOpacity
                    style={[styles.smallAddButton, { backgroundColor: '#6366f1' }]}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.grid}>
                {budgets.map((budget, i) => {
                    const progress = Math.min(budget.spent / budget.limit, 1);
                    const isOver = budget.spent > budget.limit;

                    return (
                        <GlassCard key={i} style={styles.budgetCard}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.category}>{budget.category}</Text>
                                <TouchableOpacity>
                                    <Ionicons name="ellipsis-horizontal" size={20} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.amountRow}>
                                <Text style={[styles.spentAmount, { color: isOver ? '#F43F5E' : '#FFFFFF' }]}>
                                    ${budget.spent}
                                </Text>
                                <Text style={styles.limitAmount}>/ ${budget.limit}</Text>
                            </View>

                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${progress * 100}%`,
                                                backgroundColor: isOver ? '#F43F5E' : budget.color
                                            }
                                        ]}
                                    />
                                </View>
                            </View>

                            <View style={styles.footer}>
                                <Text style={[styles.remainingText, { color: isOver ? '#F43F5E' : '#94A3B8' }]}>
                                    {isOver ? t('budget.overBudget') : `$${budget.limit - budget.spent} ${t('budget.left')}`}
                                </Text>
                            </View>
                        </GlassCard>
                    );
                })}
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        marginTop: 4,
    },
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 24,
    },
    smallAddButton: {
        width: 52,
        height: 52,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    grid: {
        flexDirection: 'column',
        gap: 16,
        paddingHorizontal: 16,
        marginBottom: 32,
    },
    budgetCard: {
        padding: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    category: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginBottom: 20,
    },
    spentAmount: {
        fontSize: 28,
        fontWeight: '800',
    },
    limitAmount: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
    },
    progressContainer: {
        marginBottom: 12,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    remainingText: {
        fontSize: 13,
        fontWeight: '700',
    },
});
