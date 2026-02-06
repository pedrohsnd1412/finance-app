import { GlassCard } from '@/components/GlassCard';
import { useColorScheme } from '@/components/useColorScheme';
import { getBankLogo } from '@/constants/Banks';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';

interface Account {
    id: string;
    name: string;
    balance: number;
    currency: string;
    type: string;
    subtype: string;
    connection: {
        connector_name: string;
    }
}

import { TransactionTypeFilter } from '@/types/home.types';

interface AccountsListProps {
    filter?: TransactionTypeFilter;
}

export default function AccountsList({ filter = 'all' }: AccountsListProps) {
    const { t, i18n } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAccounts = async () => {
        try {
            const { data, error } = await supabase
                .from('accounts')
                .select(`
                    id,
                    name,
                    balance,
                    currency,
                    type,
                    subtype,
                    connection:connection_items (
                        connector_name
                    )
                `)
                .order('balance', { ascending: false });

            if (error) throw error;
            setAccounts(data as any || []);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAccounts();
    };

    const filteredAccounts = accounts.filter(acc => {
        if (filter === 'all') return true;
        if (filter === 'credit') return acc.type === 'CREDIT_CARD';
        if (filter === 'debit') return acc.type !== 'CREDIT_CARD';
        return true;
    });

    const renderItem = ({ item }: { item: Account }) => (
        <GlassCard style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.bankInfo}>
                    <View style={styles.logoWrapper}>
                        <Image
                            source={{ uri: getBankLogo(item.connection?.connector_name) }}
                            style={styles.bankLogo}
                            resizeMode="contain"
                        />
                    </View>
                    <View>
                        <Text style={styles.bankName}>{item.connection?.connector_name || t('banks.bankFallback')}</Text>
                        <Text style={styles.accountName}>{item.name}</Text>
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </View>

            <View style={styles.cardFooter}>
                <View>
                    <Text style={styles.typeLabel}>{item.type === 'CREDIT_CARD' ? t('banks.creditCard') : t('banks.checkingAccount')}</Text>
                    <Text style={styles.balance}>
                        {new Intl.NumberFormat(i18n.language === 'pt' ? 'pt-BR' : 'en-US', {
                            style: 'currency',
                            currency: item.currency || (i18n.language === 'pt' ? 'BRL' : 'USD')
                        }).format(item.balance)}
                    </Text>
                </View>
                {item.type === 'CREDIT_CARD' && (
                    <View style={styles.tag}>
                        <Text style={styles.tagText}>MASTER</Text>
                    </View>
                )}
            </View>
        </GlassCard>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator color="#6366F1" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.sectionHeader}>
                <Text style={styles.title}>{t('banks.myAccounts')}</Text>
                <Text style={styles.count}>{filteredAccounts.length}</Text>
            </View>
            <FlatList
                data={filteredAccounts}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                scrollEnabled={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="wallet-outline" size={48} color="#94A3B8" style={{ opacity: 0.2 }} />
                        <Text style={styles.empty}>{t('banks.empty')}</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loaderContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 0,
    },
    title: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    count: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        padding: 20,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    bankInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoWrapper: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    bankLogo: {
        width: 24,
        height: 24,
    },
    bankName: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '600',
    },
    accountName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    typeLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    balance: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    tag: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    tagText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
        gap: 12,
    },
    empty: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
    },
});
