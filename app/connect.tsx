import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { pluggyApi } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

type ConnectionStatus = 'idle' | 'loading' | 'connecting' | 'success' | 'syncing' | 'complete' | 'error';

interface ConnectionResult {
    connectorName: string;
    itemId: string;
}

export default function ConnectScreen() {
    const { t } = useTranslation();
    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const [connectToken, setConnectToken] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [connectionResult, setConnectionResult] = useState<ConnectionResult | null>(null);

    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const webViewRef = useRef<WebView>(null);

    const handlePluggyMessage = async (itemId: string, connectorName?: string) => {
        console.log('[ConnectScreen] Received itemId from Pluggy:', itemId);

        // Save connection to database
        try {
            if (user) {
                console.log('[ConnectScreen] Attempting to save connection to DB...');
                const { error } = await (supabase as any)
                    .from('connections')
                    .upsert({
                        user_id: user.id,
                        pluggy_item_id: itemId,
                        connector_name: connectorName || null,
                        status: 'PENDING',
                    }, { onConflict: 'pluggy_item_id' });

                if (error) {
                    console.error('[ConnectScreen] DB Upsert Error:', error);
                    setStatus('error');
                    setErrorMessage(t('more.error'));
                    return; // Stop here if DB save fails
                }

                console.log('[ConnectScreen] DB Upsert Success');
                setStatus('success');
                setConnectionResult({
                    itemId,
                    connectorName: connectorName || t('common.loading'),
                });

                // Show syncing state after a brief success display
                setTimeout(() => {
                    console.log('[ConnectScreen] Transitioning to syncing state...');
                    setStatus('syncing');
                    checkSyncStatus(itemId);
                }, 1500);
            } else {
                console.error('[ConnectScreen] No authenticated user found');
                setStatus('error');
                setErrorMessage('Usuário não autenticado');
            }
        } catch (saveError) {
            console.error('[ConnectScreen] Exception during connection save:', saveError);
            setStatus('error');
            setErrorMessage(t('more.error'));
        }
    };

    const checkSyncStatus = async (itemId: string) => {
        // Poll for connection status update
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds max

        const checkInterval = setInterval(async () => {
            attempts++;

            try {
                const { data: connection } = await (supabase as any)
                    .from('connections')
                    .select('status, last_synced_at')
                    .eq('pluggy_item_id', itemId)
                    .single();

                if (connection?.status === 'UPDATED' || connection?.last_synced_at) {
                    console.log('[ConnectScreen] Sync complete detected');
                    clearInterval(checkInterval);
                    setStatus('complete');
                }
            } catch (err) {
                // Ignore errors during polling
            }

            if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                // Even if timeout, show complete (webhook might still process)
                setStatus('complete');
            }
        }, 1000);
    };

    // Handler for WebView messages (mobile)
    const onWebViewMessage = async (event: WebViewMessageEvent) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.event === 'onSuccess' || data.type === 'onSuccess') {
                const itemId = data.item?.id || data.itemId;
                console.log('[ConnectScreen] WebView onSuccess:', itemId);
                if (itemId) {
                    await handlePluggyMessage(itemId, data.item?.connector?.name);
                }
            } else if (data.event === 'onError' || data.type === 'onError') {
                console.error('[ConnectScreen] WebView onError:', data.error);
                setStatus('error');
                setErrorMessage(data.error?.message || t('more.error'));
            } else if (data.event === 'onClose' || data.type === 'onClose') {
                if (status !== 'success' && status !== 'syncing' && status !== 'complete') {
                    setStatus('idle');
                    setConnectToken(null);
                }
            }
        } catch {
            // Not a valid message, ignore
        }
    };

    // Injected JS to capture Pluggy events and send to React Native
    const injectedJS = `
        (function() {
            window.addEventListener('message', function(event) {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
                }
            });
            true;
        })();
    `;

    const startConnection = async () => {
        setStatus('loading');
        setErrorMessage('');

        try {
            // Use authenticated user's ID
            const userId = user?.id || 'anonymous-' + Date.now();
            const tokenData = await pluggyApi.getConnectToken(userId);
            setConnectToken(tokenData.accessToken);
            setStatus('connecting');

            // For web, set up message listener
            if (Platform.OS === 'web') {
                const handleMessage = async (event: MessageEvent) => {
                    if (!event.origin.includes('pluggy.ai')) return;

                    try {
                        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

                        if (data.event === 'onSuccess' || data.type === 'onSuccess') {
                            const itemId = data.item?.id || data.itemId;
                            if (itemId) {
                                window.removeEventListener('message', handleMessage);
                                await handlePluggyMessage(itemId, data.item?.connector?.name);
                            }
                        } else if (data.event === 'onError' || data.type === 'onError') {
                            setStatus('error');
                            setErrorMessage(data.error?.message || 'Erro ao conectar');
                        } else if (data.event === 'onClose' || data.type === 'onClose') {
                            if (status !== 'success' && status !== 'syncing' && status !== 'complete') {
                                setStatus('idle');
                                setConnectToken(null);
                            }
                        }
                    } catch {
                        // Not a JSON message, ignore
                    }
                };

                window.addEventListener('message', handleMessage);
            }
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

    const goToHome = () => {
        router.replace('/(tabs)');
    };

    const goToConnections = () => {
        router.replace('/(tabs)/more');
    };

    const renderPluggyWidget = () => {
        if (!connectToken) return null;

        const widgetUrl = `https://connect.pluggy.ai/?connect_token=${connectToken}`;



        if (Platform.OS === 'web') {
            // Web: use iframe
            return (
                <View style={styles.widgetContainer}>
                    <iframe
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

        // Mobile: use WebView
        return (
            <View style={styles.widgetContainer}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: widgetUrl }}
                    style={styles.webView}
                    onMessage={onWebViewMessage}
                    injectedJavaScript={injectedJS}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.webViewLoading}>
                            <ActivityIndicator size="large" color={theme.tint} />
                        </View>
                    )}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.error('WebView error:', nativeEvent);
                        // Don't error out immediately on mobile webview errors as they can be flaky
                        // just let user use manual button if needed
                    }}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                />

            </View>
        );
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
                                {t('more.connectNew')}
                            </Text>
                            <Text style={StyleSheet.flatten([styles.heroSubtitle, { color: theme.text, opacity: 0.6 }])}>
                                {t('more.connectNewSubtitle')}
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
                            <Text style={styles.primaryButtonText}>{t('more.connectNew').split(' ')[0]} {t('tabs.banks').slice(0, -1)}</Text>
                        </Pressable>

                        {/* Disclaimer */}
                        <Text style={StyleSheet.flatten([styles.disclaimer, { color: theme.text, opacity: 0.4 }])}>
                            {t('more.terms')}
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
                return renderPluggyWidget();

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
                            {connectionResult?.connectorName}
                        </Text>
                    </View>
                );

            case 'syncing':
                return (
                    <View style={styles.centeredContainer}>
                        <View style={StyleSheet.flatten([styles.syncIcon, { backgroundColor: theme.tint + '15' }])}>
                            <ActivityIndicator size="large" color={theme.tint} />
                        </View>
                        <Text style={StyleSheet.flatten([styles.successTitle, { color: theme.text }])}>
                            Sincronizando dados...
                        </Text>
                        <Text style={StyleSheet.flatten([styles.successSubtitle, { color: theme.text, opacity: 0.6 }])}>
                            Estamos importando suas transações do {connectionResult?.connectorName}
                        </Text>
                        <View style={styles.syncFeatures}>
                            {[
                                { icon: 'wallet-outline', text: 'Contas bancárias' },
                                { icon: 'card-outline', text: 'Cartões de crédito' },
                                { icon: 'receipt-outline', text: 'Transações' },
                            ].map((item, index) => (
                                <View key={index} style={styles.syncFeatureItem}>
                                    <Ionicons name={item.icon as any} size={18} color={theme.tint} />
                                    <Text style={StyleSheet.flatten([styles.syncFeatureText, { color: theme.text }])}>
                                        {item.text}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'complete':
                return (
                    <View style={styles.centeredContainer}>
                        <View style={StyleSheet.flatten([styles.successIcon, { backgroundColor: theme.success + '20' }])}>
                            <Ionicons name="checkmark-done-circle" size={64} color={theme.success} />
                        </View>
                        <Text style={StyleSheet.flatten([styles.successTitle, { color: theme.text }])}>
                            Tudo pronto!
                        </Text>
                        <Text style={StyleSheet.flatten([styles.successSubtitle, { color: theme.text, opacity: 0.6 }])}>
                            Sua conta {connectionResult?.connectorName} foi conectada com sucesso.
                        </Text>

                        <View style={styles.completeActions}>
                            <Pressable
                                style={StyleSheet.flatten([styles.primaryButton, { backgroundColor: theme.tint }])}
                                onPress={goToHome}
                            >
                                <Ionicons name="home-outline" size={20} color="#fff" />
                                <Text style={styles.primaryButtonText}>Ver Meus Dados</Text>
                            </Pressable>

                            <Pressable
                                style={StyleSheet.flatten([styles.secondaryButton, { borderColor: theme.tint }])}
                                onPress={goToConnections}
                            >
                                <Ionicons name="settings-outline" size={20} color={theme.tint} />
                                <Text style={StyleSheet.flatten([styles.secondaryButtonText, { color: theme.tint }])}>
                                    Gerenciar Conexões
                                </Text>
                            </Pressable>
                        </View>
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

    const showBackButton = status === 'idle' || status === 'connecting' || status === 'error';

    return (
        <Container>
            {showBackButton && (
                <Header
                    title={status === 'connecting' ? 'Selecione seu banco' : 'Conectar Conta'}
                    showBack
                    onBack={handleBack}
                />
            )}
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
    // Buttons
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
    },
    secondaryButtonText: {
        fontSize: 16,
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
    webView: {
        flex: 1,
        borderRadius: 12,
    },
    webViewLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
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
    // Syncing
    syncIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    syncFeatures: {
        marginTop: 32,
        gap: 16,
    },
    syncFeatureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    syncFeatureText: {
        fontSize: 15,
    },
    // Complete
    completeActions: {
        marginTop: 32,
        width: '100%',
        gap: 12,
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
