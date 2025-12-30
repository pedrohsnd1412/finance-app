import { Connection, ConnectionsList } from '@/components/ConnectionsList';
import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function BanksScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const { user } = useAuth();

    const [connections, setConnections] = useState<Connection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadConnections = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            // Fetch connections with their accounts
            const { data: connectionsData } = await supabase
                .from('connections')
                .select(`
                    id,
                    pluggy_item_id,
                    connector_name,
                    status,
                    last_synced_at,
                    accounts (
                        id,
                        name,
                        type,
                        balance,
                        currency
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            setConnections((connectionsData as Connection[]) || []);
        } catch (error) {
            console.log('Error loading connections:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        loadConnections();
    }, [loadConnections]);

    const onRefresh = () => {
        setRefreshing(true);
        loadConnections();
    };

    const handleDisconnect = async (connection: Connection) => {
        const confirmDelete = () => {
            return new Promise<boolean>((resolve) => {
                if (Platform.OS === 'web') {
                    resolve(window.confirm(
                        `Deseja desconectar ${connection.connector_name || 'esta conta'}? ` +
                        `Isso removerá todos os dados associados.`
                    ));
                } else {
                    Alert.alert(
                        'Desconectar Conta',
                        `Deseja desconectar ${connection.connector_name || 'esta conta'}? Isso removerá todos os dados associados.`,
                        [
                            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
                            { text: 'Desconectar', style: 'destructive', onPress: () => resolve(true) },
                        ]
                    );
                }
            });
        };

        const confirmed = await confirmDelete();
        if (!confirmed) return;

        setDeletingId(connection.id);

        try {
            // Delete connection (will cascade to accounts and transactions via FK)
            const { error } = await supabase
                .from('connections')
                .delete()
                .eq('id', connection.id);

            if (error) throw error;

            // Remove from local state
            setConnections(prev => prev.filter(c => c.id !== connection.id));
        } catch (error) {
            console.error('Error disconnecting:', error);
            if (Platform.OS === 'web') {
                window.alert('Erro ao desconectar conta');
            } else {
                Alert.alert('Erro', 'Não foi possível desconectar a conta');
            }
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <Container>
            <Header title="Contas Conectadas" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header Actions */}
                <Pressable
                    style={StyleSheet.flatten([styles.addButton, { backgroundColor: theme.tint }])}
                    onPress={() => router.push('/connect')}
                >
                    <Ionicons name="add-circle-outline" size={24} color="#fff" />
                    <Text style={styles.addButtonText}>Adicionar Nova Conta</Text>
                </Pressable>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.tint} />
                        <Text style={StyleSheet.flatten([styles.loadingText, { color: theme.text }])}>
                            Carregando conexões...
                        </Text>
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        <ConnectionsList
                            connections={connections}
                            onDisconnect={handleDisconnect}
                            deletingId={deletingId}
                        />
                    </View>
                )}
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginVertical: 16,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
    },
    listContainer: {
    },
});
