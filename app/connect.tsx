import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { pluggyApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type ConnectionStatus = 'idle' | 'loading' | 'connecting' | 'success' | 'error';

export default function ConnectScreen() {
    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const [connectToken, setConnectToken] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Listen for messages from Pluggy Connect widget
    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const handleMessage = async (event: MessageEvent) => {
            // Only accept messages from Pluggy
            if (!event.origin.includes('pluggy.ai')) return;

            try {
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                if (data.event === 'onSuccess' || data.type === 'onSuccess') {
                    const itemId = data.item?.id || data.itemId;
                    if (itemId) {
                        setStatus('success');
                        try {
                            await pluggyApi.saveConnection(itemId, data.item?.connector?.name);
                            // Navigate back after saving
                            setTimeout(() => {
                                router.back();
                            }, 1500);
                        } catch (saveError) {
                            console.error('Error saving connection:', saveError);
                        }
                    }
                } else if (data.event === 'onError' || data.type === 'onError') {
                    setStatus('error');
                    setErrorMessage(data.error?.message || 'Erro ao conectar');
                } else if (data.event === 'onClose' || data.type === 'onClose') {
                    if (status !== 'success') {
                        setStatus('idle');
                        setConnectToken(null);
                    }
                }
            } catch {
                // Not a JSON message, ignore
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [status, router]);

    const startConnection = async () => {
        setStatus('loading');
        setErrorMessage('');

        try {
            // Generate a temporary user ID for demo purposes
            const userId = 'demo-user-' + Date.now();
            const tokenData = await pluggyApi.getConnectToken(userId);
            setConnectToken(tokenData.accessToken);
            setStatus('connecting');
        } catch (error) {
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Erro ao iniciar conexão');
        }
    };

    const handleBack = () => {
        if (status === 'connecting') {
            setStatus('idle');
            setConnectToken(null);
        } else {
            router.back();
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'idle':
                return (
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Hero Section */}
                        <View style={styles.heroSection}>
                            <View style={StyleSheet.flatten([styles.heroIcon, { backgroundColor: theme.tint + '15' }])}>
                                <Ionicons name="shield-checkmark" size={48} color={theme.tint} />
                            </View>
                            <Text style={StyleSheet.flatten([styles.heroTitle, { color: theme.text }])}>
                                Conecte sua conta
                            </Text>
                            <Text style={StyleSheet.flatten([styles.heroSubtitle, { color: theme.text, opacity: 0.6 }])}>
                                Sincronize seus dados bancários de forma segura através do Open Finance.
                            </Text>
                        </View>

                        {/* Features */}
                        <View style={styles.featuresSection}>
                            {[
                                { icon: 'lock-closed', title: 'Conexão segura', desc: 'Dados criptografados ponta-a-ponta' },
                                { icon: 'sync', title: 'Atualização automática', desc: 'Transações sincronizadas em tempo real' },
                                { icon: 'eye-off', title: 'Privacidade total', desc: 'Nós não armazenamos suas credenciais' },
                            ].map((feature, index) => (
                                <View
                                    key={index}
                                    style={StyleSheet.flatten([styles.featureCard, { backgroundColor: theme.card }])}
                                >
                                    <View style={StyleSheet.flatten([styles.featureIcon, { backgroundColor: theme.tint + '15' }])}>
                                        <Ionicons name={feature.icon as any} size={24} color={theme.tint} />
                                    </View>
                                    <View style={styles.featureText}>
                                        <Text style={StyleSheet.flatten([styles.featureTitle, { color: theme.text }])}>
                                            {feature.title}
                                        </Text>
                                        <Text style={StyleSheet.flatten([styles.featureDesc, { color: theme.text, opacity: 0.6 }])}>
                                            {feature.desc}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Connect Button */}
                        <Pressable
                            style={StyleSheet.flatten([styles.primaryButton, { backgroundColor: theme.tint }])}
                            onPress={startConnection}
                        >
                            <Ionicons name="link" size={22} color="#fff" />
                            <Text style={styles.primaryButtonText}>Conectar Banco</Text>
                        </Pressable>

                        {/* Disclaimer */}
                        <Text style={StyleSheet.flatten([styles.disclaimer, { color: theme.text, opacity: 0.4 }])}>
                            Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
                        </Text>
                    </ScrollView>
                );

            case 'loading':
                return (
                    <View style={styles.centeredContainer}>
                        <ActivityIndicator size="large" color={theme.tint} />
                        <Text style={StyleSheet.flatten([styles.statusText, { color: theme.text }])}>
                            Preparando conexão...
                        </Text>
                    </View>
                );

            case 'connecting':
                return (
                    <View style={styles.widgetContainer}>
                        {Platform.OS === 'web' && connectToken && (
                            <iframe
                                ref={iframeRef}
                                src={`https://connect.pluggy.ai/?connect_token=${connectToken}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    borderRadius: 12,
                                }}
                                allow="camera"
                            />
                        )}
                    </View>
                );

            case 'success':
                return (
                    <View style={styles.centeredContainer}>
                        <View style={StyleSheet.flatten([styles.successIcon, { backgroundColor: theme.success + '20' }])}>
                            <Ionicons name="checkmark-circle" size={64} color={theme.success} />
                        </View>
                        <Text style={StyleSheet.flatten([styles.successTitle, { color: theme.text }])}>
                            Conta conectada!
                        </Text>
                        <Text style={StyleSheet.flatten([styles.successSubtitle, { color: theme.text, opacity: 0.6 }])}>
                            Seus dados estão sendo sincronizados...
                        </Text>
                    </View>
                );

            case 'error':
                return (
                    <View style={styles.centeredContainer}>
                        <View style={StyleSheet.flatten([styles.errorIcon, { backgroundColor: theme.error + '20' }])}>
                            <Ionicons name="close-circle" size={64} color={theme.error} />
                        </View>
                        <Text style={StyleSheet.flatten([styles.errorTitle, { color: theme.text }])}>
                            Erro na conexão
                        </Text>
                        <Text style={StyleSheet.flatten([styles.errorMessage, { color: theme.text, opacity: 0.6 }])}>
                            {errorMessage || 'Não foi possível conectar sua conta. Tente novamente.'}
                        </Text>
                        <Pressable
                            style={StyleSheet.flatten([styles.retryButton, { backgroundColor: theme.tint }])}
                            onPress={() => setStatus('idle')}
                        >
                            <Text style={styles.retryButtonText}>Tentar novamente</Text>
                        </Pressable>
                    </View>
                );
        }
    };

    return (
        <Container>
            <Header
                title={status === 'connecting' ? 'Selecione seu banco' : 'Conectar Conta'}
                showBack
                onBack={handleBack}
            />
            {renderContent()}
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
    // Hero Section
    heroSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 24,
    },
    heroIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: 320,
    },
    // Features
    featuresSection: {
        paddingHorizontal: 16,
        marginBottom: 32,
        gap: 12,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 16,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        flex: 1,
        gap: 2,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    featureDesc: {
        fontSize: 14,
    },
    // Button
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    disclaimer: {
        fontSize: 12,
        textAlign: 'center',
        paddingHorizontal: 32,
        lineHeight: 18,
    },
    // Centered containers
    centeredContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    statusText: {
        marginTop: 16,
        fontSize: 16,
    },
    // Widget
    widgetContainer: {
        flex: 1,
        margin: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    // Success
    successIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    // Error
    errorIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
