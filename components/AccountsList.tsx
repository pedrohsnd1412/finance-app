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

            // Map the data to Flatten the structure if needed or keep as is
            // The existing render expects item.connection.connector_name which matches this query structure
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
        // 'debit' maps to 'Conta Corrente' label
        if (filter === 'debit') return acc.type !== 'CREDIT_CARD';
        return true;
    });

    const renderItem = ({ item }: { item: Account }) => (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.header}>
                <View style={styles.bankInfo}>
                    <Image
                        source={{ uri: getBankLogo(item.connection?.connector_name) }}
                        style={styles.bankLogo}
                        resizeMode="contain"
                    />
                    <Text style={[styles.bankName, { color: theme.muted }]}>{item.connection?.connector_name || t('banks.bankFallback')}</Text>
                </View>
                <Ionicons name="wallet-outline" size={20} color={theme.muted} />
            </View>
            <Text style={[styles.accountName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.balance, { color: theme.text }]}>
                {new Intl.NumberFormat(i18n.language === 'pt' ? 'pt-BR' : 'en-US', {
                    style: 'currency',
                    currency: item.currency || (i18n.language === 'pt' ? 'BRL' : 'USD')
                }).format(item.balance)}
            </Text>
            <Text style={[styles.type, { color: theme.muted }]}>{item.type} - {item.subtype}</Text>
        </View>
    );

    if (loading && !refreshing) {
        return <ActivityIndicator style={styles.loader} />;
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.text }]}>{t('banks.myAccounts')}</Text>
            <FlatList
                data={filteredAccounts}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                scrollEnabled={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.tint} />}
                ListEmptyComponent={<Text style={[styles.empty, { color: theme.muted }]}>{t('banks.empty')}</Text>}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loader: {
        marginTop: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    bankInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bankLogo: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    bankName: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    accountName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    balance: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#000',
    },
    type: {
        fontSize: 12,
        color: '#999',
        textTransform: 'uppercase',
    },
    empty: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
    },
});
