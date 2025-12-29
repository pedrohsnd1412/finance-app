import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { pluggyApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// For web, we'll use an iframe. For native, we'd use WebView
const isWeb = Platform.OS === 'web';

type ConnectionStatus = 'idle' | 'loading' | 'connecting' | 'success' | 'error';

export default function ConnectScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const [connectToken, setConnectToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement | null>(null);

    // Listen for Pluggy Connect Widget messages
    useEffect(() => {
        if (!isWeb) return;

        const handleMessage = async (event: MessageEvent) => {
            // Verify origin (Pluggy Connect Widget)
            if (!event.origin.includes('pluggy.ai') && !event.origin.includes('localhost')) {
                return;
            }

            const { data } = event;
            console.log('Pluggy Connect message:', data);

            if (data.event === 'onSuccess' || data.type === 'onSuccess') {
                // Connection successful
                const itemId = data.item?.id || data.itemId;
                const connectorName = data.item?.connector?.name;

                if (itemId) {
                    setStatus('success');
                    try {
                        await pluggyApi.saveConnection(itemId, connectorName);
                        // Navigate to dashboard after brief delay
                        setTimeout(() => {
                            router.replace('/(tabs)');
                        }, 2000);
                    } catch (err) {
                        console.error('Error saving connection:', err);
                        setError('Conexão criada, mas houve um erro ao salvar. Tente novamente.');
                        setStatus('error');
                    }
                }
            } else if (data.event === 'onError' || data.type === 'onError') {
                setError(data.error?.message || 'Erro na conexão');
                setStatus('error');
            } else if (data.event === 'onClose' || data.type === 'onClose') {
                if (status === 'connecting') {
                    setStatus('idle');
                    setConnectToken(null);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [status, router]);

    const startConnection = useCallback(async () => {
        setStatus('loading');
        setError(null);

        try {
            // Get current user (or use a temporary ID for demo)
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || 'demo-user-1';

            // Get connect token from our backend
            const tokenData = await pluggyApi.getConnectToken(userId);
            setConnectToken(tokenData.accessToken);
            setStatus('connecting');
        } catch (err) {
            console.error('Error getting connect token:', err);
            setError(err instanceof Error ? err.message : 'Erro ao iniciar conexão');
            setStatus('error');
        }
    }, []);

    const renderContent = () => {
        switch (status) {
            case 'idle':
                return (
                    <View style={styles.centerContent}>
                        <View style={StyleSheet.flatten([styles.iconContainer, { backgroundColor: theme.tint + '20' }])}>
                            <Ionicons name="link" size={48} color={theme.tint} />
                        </View>
                        <Text style={StyleSheet.flatten([styles.title, { color: theme.text }])}>
                            Conectar Conta Bancária
                        </Text>
                        <Text style={StyleSheet.flatten([styles.description, { color: theme.text, opacity: 0.7 }])}>
                            Conecte suas contas bancárias de forma segura via Open Finance para visualizar
                            todas suas transações em um só lugar.
                        </Text>

                        <Pressable
                            style={StyleSheet.flatten([styles.button, { backgroundColor: theme.tint }])}
                            onPress={startConnection}
                        >
                            <Ionicons name="add-circle-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Conectar Banco</Text>
                        </Pressable>

                        <View style={styles.features}>
                            {[
                                { icon: 'shield-checkmark-outline', text: 'Conexão 100% segura' },
                                { icon: 'sync-outline', text: 'Sincronização automática' },
                                { icon: 'eye-off-outline', text: 'Você controla seus dados' },
                            ].map((feature, index) => (
                                <View key={index} style={styles.featureRow}>
                                    <Ionicons
                                        name={feature.icon as any}
                                        size={20}
                                        color={theme.success}
                                    />
                                    <Text style={StyleSheet.flatten([styles.featureText, { color: theme.text }])}>
                                        {feature.text}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'loading':
                return (
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color={theme.tint} />
                        <Text style={StyleSheet.flatten([styles.loadingText, { color: theme.text }])}>
                            Preparando conexão segura...
                        </Text>
                    </View>
                );

            case 'connecting':
                if (isWeb && connectToken) {
                    // Render Pluggy Connect Widget in iframe
                    const widgetUrl = `https://connect.pluggy.ai/?connect_token=${connectToken}`;
                    return (
                        <View style={styles.widgetContainer}>
                            <iframe
                                ref={iframeRef as any}
                                src={widgetUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    borderRadius: 12,
                                }}
                                allow="camera"
                            />
                        </View>
                    );
                }
                return (
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color={theme.tint} />
                        <Text style={StyleSheet.flatten([styles.loadingText, { color: theme.text }])}>
                            Abrindo conexão...
                        </Text>
                    </View>
                );

            case 'success':
                return (
                    <View style={styles.centerContent}>
                        <View style={StyleSheet.flatten([styles.iconContainer, { backgroundColor: theme.success + '20' }])}>
                            <Ionicons name="checkmark-circle" size={48} color={theme.success} />
                        </View>
                        <Text style={StyleSheet.flatten([styles.title, { color: theme.text }])}>
                            Conta Conectada!
                        </Text>
                        <Text style={StyleSheet.flatten([styles.description, { color: theme.text, opacity: 0.7 }])}>
                            Sua conta foi conectada com sucesso. Suas transações serão sincronizadas em breve.
                        </Text>
                        <ActivityIndicator size="small" color={theme.tint} style={{ marginTop: 24 }} />
                        <Text style={StyleSheet.flatten([styles.redirectText, { color: theme.text, opacity: 0.5 }])}>
                            Redirecionando para o dashboard...
                        </Text>
                    </View>
                );

            case 'error':
                return (
                    <View style={styles.centerContent}>
                        <View style={StyleSheet.flatten([styles.iconContainer, { backgroundColor: theme.error + '20' }])}>
                            <Ionicons name="alert-circle" size={48} color={theme.error} />
                        </View>
                        <Text style={StyleSheet.flatten([styles.title, { color: theme.text }])}>
                            Erro na Conexão
                        </Text>
                        <Text style={StyleSheet.flatten([styles.description, { color: theme.error }])}>
                            {error}
                        </Text>
                        <Pressable
                            style={StyleSheet.flatten([styles.button, { backgroundColor: theme.tint }])}
                            onPress={() => setStatus('idle')}
                        >
                            <Ionicons name="refresh-outline" size={24} color="#fff" />
                            <Text style={styles.buttonText}>Tentar Novamente</Text>
                        </Pressable>
                    </View>
                );
        }
    };

    return (
        <Container>
            <Header
                title="Conectar"
                showBack={status !== 'connecting'}
                onBack={() => router.back()}
            />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {renderContent()}
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingVertical: 24,
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginBottom: 32,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    features: {
        alignSelf: 'stretch',
        gap: 16,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 14,
    },
    loadingText: {
        fontSize: 16,
        marginTop: 16,
    },
    redirectText: {
        fontSize: 14,
        marginTop: 8,
    },
    widgetContainer: {
        flex: 1,
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
        minHeight: 600,
    },
});
