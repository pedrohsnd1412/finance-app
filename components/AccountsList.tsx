import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

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

export default function AccountsList() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAccounts = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('get-accounts');
            if (error) throw error;
            setAccounts(data.accounts || []);
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

    const renderItem = ({ item }: { item: Account }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.bankName}>{item.connection?.connector_name || 'Bank'}</Text>
                <Ionicons name="wallet-outline" size={20} color="#666" />
            </View>
            <Text style={styles.accountName}>{item.name}</Text>
            <Text style={styles.balance}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: item.currency || 'BRL' }).format(item.balance)}
            </Text>
            <Text style={styles.type}>{item.type} - {item.subtype}</Text>
        </View>
    );

    if (loading && !refreshing) {
        return <ActivityIndicator style={styles.loader} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Minhas Contas</Text>
            <FlatList
                data={accounts}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={styles.empty}>Nenhuma conta conectada.</Text>}
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
