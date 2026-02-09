import { GlassCard } from '@/components/GlassCard';
import { useColorScheme } from '@/components/useColorScheme';
import { getBankLogo } from '@/constants/Banks';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { TransactionTypeFilter } from '@/types/home.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
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

interface BankGroup {
    name: string;
    accounts: Account[];
}

interface AccountsListProps {
    filter?: TransactionTypeFilter;
    hideHeader?: boolean;
}

export default function AccountsList({ filter = 'all', hideHeader = false }: AccountsListProps) {
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

    const filteredAccounts = useMemo(() => {
        return accounts.filter(acc => {
            if (filter === 'all') return true;
            if (filter === 'credit') return acc.type === 'CREDIT_CARD';
            if (filter === 'debit') return acc.type !== 'CREDIT_CARD';
            return true;
        });
    }, [accounts, filter]);

    const groupedAccounts = useMemo(() => {
        const groups: Record<string, Account[]> = {};
        filteredAccounts.forEach(acc => {
            const bankName = acc.connection?.connector_name || t('banks.bankFallback');
            if (!groups[bankName]) groups[bankName] = [];
            groups[bankName].push(acc);
        });

        // Convert to array and maybe sort by bank name or total balance?
        // Sorting by name for now, or keep insertion order? Object keys iteration order is tricky.
        // Let's sort alphabetically or by balance.
        return Object.entries(groups).map(([name, accounts]) => ({
            name,
            accounts
        })).sort((a, b) => a.name.localeCompare(b.name));
    }, [filteredAccounts, t]);

    const renderGroup = ({ item }: { item: BankGroup }) => (
        <GlassCard style={styles.bankCard}>
            <View style={styles.bankHeader}>
                <View style={styles.logoWrapper}>
                    <Image
                        source={{ uri: getBankLogo(item.name) }}
                        style={styles.bankLogo}
                        resizeMode="contain"
                    />
                </View>
                <Text style={styles.bankName}>{item.name}</Text>
            </View>

            <View style={styles.accountsContainer}>
                {item.accounts.map((account, index) => (
                    <View key={account.id} style={[
                        styles.accountRow,
                        index === item.accounts.length - 1 && styles.lastAccountRow
                    ]}>
                        <View style={{ flex: 1, gap: 4 }}>
                            <Text style={styles.accountName}>{account.name}</Text>
                            <Text style={styles.typeLabel}>
                                {account.type === 'CREDIT_CARD' ? t('banks.creditCard') : t('banks.checkingAccount')}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                            <Text style={styles.balance}>
                                {new Intl.NumberFormat(i18n.language === 'pt' ? 'pt-BR' : 'en-US', {
                                    style: 'currency',
                                    currency: account.currency || (i18n.language === 'pt' ? 'BRL' : 'USD')
                                }).format(account.balance)}
                            </Text>
                            {account.type === 'CREDIT_CARD' && (
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>MASTER</Text>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
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
            {!hideHeader && (
                <View style={styles.sectionHeader}>
                    <Text style={styles.title}>{t('banks.myAccounts')}</Text>
                    <Text style={styles.count}>{filteredAccounts.length}</Text>
                </View>
            )}
            <FlatList
                data={groupedAccounts}
                keyExtractor={(item) => item.name}
                renderItem={renderGroup}
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
    bankCard: {
        padding: 20,
        marginBottom: 24,
    },
    bankHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
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
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    accountsContainer: {
        gap: 0,
    },
    accountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    lastAccountRow: {
        borderBottomWidth: 0,
        paddingBottom: 0,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    typeLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    balance: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    tag: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    tagText: {
        fontSize: 9,
        fontWeight: '700',
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
