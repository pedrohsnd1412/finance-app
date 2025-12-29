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

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { signUp } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            setError('Preencha todos os campos');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setIsLoading(true);
        setError(null);

        const { error: signUpError } = await signUp(email, password);

        setIsLoading(false);

        if (signUpError) {
            if (signUpError.message.includes('already')) {
                setError('Este email já está cadastrado');
            } else {
                setError(signUpError.message);
            }
        } else {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <View style={StyleSheet.flatten([styles.container, styles.successContainer, { backgroundColor: theme.background }])}>
                <View style={StyleSheet.flatten([styles.successIcon, { backgroundColor: theme.success + '20' }])}>
                    <Ionicons name="checkmark-circle" size={64} color={theme.success} />
                </View>
                <Text style={StyleSheet.flatten([styles.successTitle, { color: theme.text }])}>
                    Conta criada!
                </Text>
                <Text style={StyleSheet.flatten([styles.successText, { color: theme.text, opacity: 0.6 }])}>
                    Verifique seu email para confirmar o cadastro, depois você pode fazer login.
                </Text>
                <Pressable
                    style={StyleSheet.flatten([styles.button, { backgroundColor: theme.tint }])}
                    onPress={() => router.replace('/auth/login')}
                >
                    <Text style={styles.buttonText}>Ir para Login</Text>
                </Pressable>
            </View>
        );
    }

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
                {/* Header */}
                <View style={styles.header}>
                    <View style={StyleSheet.flatten([styles.logoContainer, { backgroundColor: theme.tint }])}>
                        <Ionicons name="person-add" size={36} color="#fff" />
                    </View>
                    <Text style={StyleSheet.flatten([styles.title, { color: theme.text }])}>
                        Criar Conta
                    </Text>
                    <Text style={StyleSheet.flatten([styles.subtitle, { color: theme.text, opacity: 0.6 }])}>
                        Crie sua conta para começar
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
                                placeholder="Mínimo 6 caracteres"
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

                    {/* Confirm Password */}
                    <View style={styles.inputContainer}>
                        <Text style={StyleSheet.flatten([styles.label, { color: theme.text }])}>
                            Confirmar Senha
                        </Text>
                        <View style={StyleSheet.flatten([styles.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }])}>
                            <Ionicons name="lock-closed-outline" size={20} color={theme.text} style={{ opacity: 0.5 }} />
                            <TextInput
                                style={StyleSheet.flatten([styles.input, { color: theme.text }])}
                                placeholder="Digite a senha novamente"
                                placeholderTextColor={theme.text + '50'}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                            />
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

                    {/* Register Button */}
                    <Pressable
                        style={StyleSheet.flatten([
                            styles.button,
                            { backgroundColor: theme.tint },
                            isLoading && styles.buttonDisabled
                        ])}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Criar Conta</Text>
                        )}
                    </Pressable>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={StyleSheet.flatten([styles.loginText, { color: theme.text, opacity: 0.6 }])}>
                            Já tem uma conta?{' '}
                        </Text>
                        <Link href="/auth/login" asChild>
                            <Pressable>
                                <Text style={StyleSheet.flatten([styles.loginLink, { color: theme.tint }])}>
                                    Entrar
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
        marginBottom: 32,
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
    },
    loginText: {
        fontSize: 14,
    },
    loginLink: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Success state
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
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
        marginBottom: 12,
    },
    successText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
});
