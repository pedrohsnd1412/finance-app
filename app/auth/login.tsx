import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { signIn } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Preencha todos os campos');
            return;
        }

        setIsLoading(true);
        setError(null);

        const { error: signInError } = await signIn(email, password);

        if (signInError) {
            setError(signInError.message === 'Invalid login credentials'
                ? 'Email ou senha incorretos'
                : signInError.message);
            setIsLoading(false);
        } else {
            router.replace('/(tabs)');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={StyleSheet.flatten([styles.container, { backgroundColor: theme.background }])}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Logo/Header */}
                <View style={styles.header}>
                    <View style={StyleSheet.flatten([styles.logoContainer, { backgroundColor: theme.tint }])}>
                        <Ionicons name="wallet" size={40} color="#fff" />
                    </View>
                    <Text style={StyleSheet.flatten([styles.title, { color: theme.text }])}>
                        Finance App
                    </Text>
                    <Text style={StyleSheet.flatten([styles.subtitle, { color: theme.text, opacity: 0.6 }])}>
                        Entre para acessar suas finanças
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Email */}
                    <View style={styles.inputContainer}>
                        <Text style={StyleSheet.flatten([styles.label, { color: theme.text }])}>
                            Email
                        </Text>
                        <View style={StyleSheet.flatten([styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }])}>
                            <Ionicons name="mail-outline" size={20} color={theme.text} style={{ opacity: 0.5 }} />
                            <TextInput
                                style={StyleSheet.flatten([styles.input, { color: theme.text }])}
                                placeholder="seu@email.com"
                                placeholderTextColor={theme.text + '50'}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.inputContainer}>
                        <Text style={StyleSheet.flatten([styles.label, { color: theme.text }])}>
                            Senha
                        </Text>
                        <View style={StyleSheet.flatten([styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }])}>
                            <Ionicons name="lock-closed-outline" size={20} color={theme.text} style={{ opacity: 0.5 }} />
                            <TextInput
                                style={StyleSheet.flatten([styles.input, { color: theme.text }])}
                                placeholder="••••••••"
                                placeholderTextColor={theme.text + '50'}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={theme.text}
                                    style={{ opacity: 0.5 }}
                                />
                            </Pressable>
                        </View>
                    </View>

                    {/* Error */}
                    {error && (
                        <View style={StyleSheet.flatten([styles.errorContainer, { backgroundColor: theme.error + '15' }])}>
                            <Ionicons name="alert-circle" size={18} color={theme.error} />
                            <Text style={StyleSheet.flatten([styles.errorText, { color: theme.error }])}>
                                {error}
                            </Text>
                        </View>
                    )}

                    {/* Login Button */}
                    <Pressable
                        style={StyleSheet.flatten([
                            styles.button,
                            { backgroundColor: theme.tint },
                            isLoading && styles.buttonDisabled
                        ])}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Entrar</Text>
                        )}
                    </Pressable>

                    {/* Register Link */}
                    <View style={styles.registerContainer}>
                        <Text style={StyleSheet.flatten([styles.registerText, { color: theme.text, opacity: 0.6 }])}>
                            Não tem uma conta?{' '}
                        </Text>
                        <Link href="/auth/register" asChild>
                            <Pressable>
                                <Text style={StyleSheet.flatten([styles.registerLink, { color: theme.tint }])}>
                                    Criar conta
                                </Text>
                            </Pressable>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 10,
    },
    errorText: {
        fontSize: 14,
        flex: 1,
    },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    registerText: {
        fontSize: 14,
    },
    registerLink: {
        fontSize: 14,
        fontWeight: '600',
    },
});
