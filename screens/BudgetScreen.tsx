import { Container } from '@/components/Container';
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
        <Container>
            {isDesktop && (
                <Text style={[styles.desktopTitle, { color: theme.text }]}>
                    {t('budget.title')}
                </Text>
            )}

            <View style={styles.grid}>
                {budgets.map((budget, i) => {
                    const progress = Math.min(budget.spent / budget.limit, 1);
                    const isOver = budget.spent > budget.limit;

                    return (
                        <View key={i} style={[styles.budgetCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.category, { color: theme.text }]}>{budget.category}</Text>
                                <TouchableOpacity>
                                    <Ionicons name="ellipsis-horizontal" size={20} color={theme.muted} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.progressContainer}>
                                <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${progress * 100}%`,
                                                backgroundColor: isOver ? theme.error : budget.color
                                            }
                                        ]}
                                    />
                                </View>
                            </View>

                            <View style={styles.footer}>
                                <Text style={[styles.spentText, { color: isOver ? theme.error : theme.text }]}>
                                    ${budget.spent} <Text style={{ color: theme.muted, fontWeight: '400' }}>{t('budget.of')} ${budget.limit}</Text>
                                </Text>
                                <Text style={[styles.remainingText, { color: isOver ? theme.error : theme.muted }]}>
                                    {isOver ? t('budget.overBudget') : `$${budget.limit - budget.spent} ${t('budget.left')}`}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>

            <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.tint }]}>
                <Ionicons name="add" size={24} color="#FFF" />
                <Text style={styles.addButtonText}>{t('budget.createNew')}</Text>
            </TouchableOpacity>
        </Container>
    );
}

const styles = StyleSheet.create({
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 24,
        marginTop: 8,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
        marginBottom: 32,
    },
    budgetCard: {
        width: '48%',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    category: {
        fontSize: 18,
        fontWeight: '700',
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressBar: {
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    spentText: {
        fontSize: 16,
        fontWeight: '700',
    },
    remainingText: {
        fontSize: 14,
        fontWeight: '500',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        gap: 12,
        maxWidth: 300,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
