import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface Account {
    id: string;
    name: string;
    type: 'BANK' | 'CREDIT' | 'INVESTMENT';
    balance: number;
    currency: string;
}

export interface Connection {
    id: string;
    pluggy_item_id: string;
    connector_name: string | null;
    status: string;
    last_synced_at: string | null;
    accounts: Account[];
}

interface ConnectionsListProps {
    connections: Connection[];
    onDisconnect: (connection: Connection) => void;
    deletingId: string | null;
}

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Sincronizando...';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return 'Data desconhecida';
    }
};

const getAccountTypeLabel = (type: string): string => {
    switch (type) {
        case 'BANK': return 'Conta Corrente';
        case 'CREDIT': return 'Cartão de Crédito';
        case 'INVESTMENT': return 'Investimentos';
        default: return type;
    }
};

const getAccountTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
        case 'BANK': return 'wallet-outline';
        case 'CREDIT': return 'card-outline';
        case 'INVESTMENT': return 'trending-up-outline';
        default: return 'cash-outline';
    }
};

export function ConnectionsList({ connections, onDisconnect, deletingId }: ConnectionsListProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    if (!connections || connections.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Ionicons name="wallet-outline" size={48} color={theme.text} style={{ opacity: 0.3 }} />
                <Text style={StyleSheet.flatten([styles.emptyText, { color: theme.text, opacity: 0.5 }])}>
                    Nenhuma conta conectada ainda
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {connections.map((connection) => (
                <View key={connection.id} style={styles.connectionSection}>
                    {/* Connection Header */}
                    <View style={StyleSheet.flatten([styles.connectionHeader, { backgroundColor: theme.card }])}>
                        <View style={StyleSheet.flatten([styles.bankIcon, { backgroundColor: theme.tint + '20' }])}>
                            <Ionicons name="business" size={28} color={theme.tint} />
                        </View>
                        <View style={styles.connectionInfo}>
                            <Text style={StyleSheet.flatten([styles.connectionName, { color: theme.text }])}>
                                {connection.connector_name || 'Instituição Financeira'}
                            </Text>
                            <View style={styles.statusRow}>
                                <View style={StyleSheet.flatten([
                                    styles.statusBadge,
                                    { backgroundColor: connection.status === 'UPDATED' ? theme.success + '20' : theme.warning + '20' }
                                ])}>
                                    <View style={StyleSheet.flatten([
                                        styles.statusDot,
                                        { backgroundColor: connection.status === 'UPDATED' ? theme.success : theme.warning }
                                    ])} />
                                    <Text style={StyleSheet.flatten([
                                        styles.statusBadgeText,
                                        { color: connection.status === 'UPDATED' ? theme.success : theme.warning }
                                    ])}>
                                        {connection.status === 'UPDATED' ? 'Sincronizado' :
                                            connection.status === 'PENDING' ? 'Pendente' :
                                                connection.status === 'UPDATING' ? 'Atualizando...' : 'Erro'}
                                    </Text>
                                </View>
                                <Text style={StyleSheet.flatten([styles.syncTime, { color: theme.text, opacity: 0.5 }])} numberOfLines={1}>
                                    {formatDate(connection.last_synced_at)}
                                </Text>
                            </View>
                        </View>

                        {/* Disconnect Button */}
                        <Pressable
                            style={styles.disconnectButton}
                            onPress={() => onDisconnect(connection)}
                            disabled={deletingId === connection.id}
                        >
                            {deletingId === connection.id ? (
                                <ActivityIndicator size="small" color={theme.error} />
                            ) : (
                                <Ionicons name="trash-outline" size={20} color={theme.error} />
                            )}
                        </Pressable>
                    </View>

                    {/* Accounts List */}
                    {connection.accounts && connection.accounts.length > 0 && (
                        <View style={styles.accountsList}>
                            {connection.accounts.map((account) => (
                                <View
                                    key={account.id}
                                    style={StyleSheet.flatten([styles.accountCard, { backgroundColor: theme.card }])}
                                >
                                    <View style={StyleSheet.flatten([
                                        styles.accountTypeIcon,
                                        { backgroundColor: account.type === 'CREDIT' ? theme.error + '15' : theme.success + '15' }
                                    ])}>
                                        <Ionicons
                                            name={getAccountTypeIcon(account.type)}
                                            size={20}
                                            color={account.type === 'CREDIT' ? theme.error : theme.success}
                                        />
                                    </View>
                                    <View style={styles.accountInfo}>
                                        <Text style={StyleSheet.flatten([styles.accountName, { color: theme.text }])}>
                                            {account.name}
                                        </Text>
                                        <View style={StyleSheet.flatten([styles.accountTypeBadge, { backgroundColor: theme.tint + '15' }])}>
                                            <Text style={StyleSheet.flatten([styles.accountTypeText, { color: theme.tint }])}>
                                                {getAccountTypeLabel(account.type)}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={StyleSheet.flatten([
                                        styles.accountBalance,
                                        { color: account.type === 'CREDIT' ? theme.error : theme.text }
                                    ])}>
                                        {formatCurrency(account.balance)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
    },
    // Connection Section
    connectionSection: {
        marginBottom: 20,
    },
    connectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 14,
    },
    bankIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    connectionInfo: {
        flex: 1,
        gap: 6,
    },
    connectionName: {
        fontSize: 16,
        fontWeight: '700',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusBadgeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    syncTime: {
        fontSize: 11,
    },
    disconnectButton: {
        padding: 8,
        marginLeft: -8,
        alignSelf: 'flex-start',
    },
    // Accounts List
    accountsList: {
        marginTop: 8,
        gap: 8,
        paddingLeft: 20,
    },
    accountCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 10,
        gap: 12,
    },
    accountTypeIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    accountInfo: {
        flex: 1,
        gap: 4,
    },
    accountName: {
        fontSize: 15,
        fontWeight: '600',
    },
    accountTypeBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    accountTypeText: {
        fontSize: 11,
        fontWeight: '600',
    },
    accountBalance: {
        fontSize: 15,
        fontWeight: '700',
    },
});
