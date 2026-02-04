import { supabase } from '@/lib/supabase'; // Assuming there is a supabase client instance export
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface PluggyConnectProps {
    onSuccess: (itemData: any) => void;
    onError: (error: any) => void;
    onClose: () => void;
}

export default function PluggyConnect({ onSuccess, onError, onClose }: PluggyConnectProps) {
    const [connectToken, setConnectToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchConnectToken();
    }, []);

    const fetchConnectToken = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Usuário não autenticado");
            }

            console.log("Fetching Pluggy Connect Token...");
            const { data, error } = await supabase.functions.invoke('pluggy-connect-token');

            if (error) {
                console.error("Supabase Function Error:", error);
                throw error;
            }
            if (data?.error) {
                console.error("Edge Function Error:", data.error);
                throw new Error(data.error);
            }

            console.log("Token received:", data.accessToken ? "Yes" : "No");
            setConnectToken(data.accessToken);
        } catch (err: any) {
            console.error("Error fetching connect token:", err);
            setErrorMsg(err.message || "Erro desconhecido ao iniciar conexão.");
            onError(err);
            // Do not close immediately so user can see error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (Platform.OS === 'web') {
            const handleWebMessage = (event: any) => {
                const data = event.data;
                // Reuse the same logic as handleWebViewMessage, but event structure might differ slightly
                // Pluggy sends data object directly
                if (data.type || data.event) {
                    handleEventData(data);
                }
            };
            window.addEventListener('message', handleWebMessage);
            return () => window.removeEventListener('message', handleWebMessage);
        }
    }, []);

    const handleEventData = (data: any) => {
        switch (data.type) {
            case 'onSuccess':
                console.log("Pluggy Connect Success:", data);
                onSuccess(data.item);
                break;
            case 'onError':
                console.log("Pluggy Connect Error:", data);
                setErrorMsg(data.error?.message || "Erro na conexão com Pluggy.");
                onError(data.error);
                break;
            case 'onClose':
                onClose();
                break;
            default:
                if (data.event === 'onSuccess') onSuccess(data.item);
                if (data.event === 'onError') {
                    setErrorMsg(data.error?.message || "Erro na conexão com Pluggy.");
                    onError(data.error);
                }
                if (data.event === 'onClose') onClose();
                break;
        }
    }

    const handleWebViewMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            handleEventData(data);
        } catch (e) {
            // Ignore non-JSON messages
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={{ marginTop: 10 }}>Iniciando conexão segura...</Text>
            </View>
        );
    }

    if (errorMsg) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Ocorreu um erro:</Text>
                <Text style={styles.errorDetail}>{errorMsg}</Text>
                <Text style={styles.helpText}>Verifique se as variáveis de ambiente (Secrets) foram configuradas no Supabase.</Text>
            </View>
        );
    }

    if (!connectToken) {
        return (
            <View style={styles.errorContainer}>
                <Text>Não foi possível gerar o token de conexão.</Text>
            </View>
        );
    }

    const connectUrl = `https://connect.pluggy.ai/?connect_token=${connectToken}`;

    if (Platform.OS === 'web') {
        return (
            <View style={styles.webview}>
                <iframe
                    src={connectUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                />
            </View>
        );
    }

    const injectedJavaScript = `
    window.addEventListener('message', function(event) {
        window.ReactNativeWebView.postMessage(JSON.stringify(event.data));
    });
    true;
  `;

    return (
        <WebView
            source={{ uri: connectUrl }}
            style={styles.webview}
            onMessage={handleWebViewMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            injectedJavaScript={injectedJavaScript}
            originWhitelist={['*']}
        />
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    webview: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#EF4444',
        marginBottom: 8,
    },
    errorDetail: {
        fontSize: 14,
        color: '#374151',
        textAlign: 'center',
        marginBottom: 16,
    },
    helpText: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    }
});
