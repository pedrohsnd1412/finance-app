import { Container } from '@/components/Container';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function ChatScreen() {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [messages] = useState([
        { id: 1, type: 'bot', text: 'Olá! Eu sou sua assistente financeira de IA. Como posso ajudar você hoje?' },
        { id: 2, type: 'user', text: 'Analise meus gastos do mês passado.' },
        { id: 3, type: 'bot', text: 'No mês passado, você gastou R$ 1.256,00. Sua principal categoria foi Shopping, que representou 25% do total de suas despesas.' }
    ]);

    const [inputText, setInputText] = useState('');

    const suggestions = [
        { label: t('more.insight'), text: '"Como posso economizar R$ 500 este mês?"', color: '#6366F1' },
        { label: t('more.analysis'), text: '"Compare meus gastos com o ano passado."', color: '#A855F7' },
        { label: t('more.optimization'), text: '"Qual assinatura devo cancelar?"', color: '#10B981' },
    ];

    return (
        <Container style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={100}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>
                            {t('more.aiAssistant')}
                        </Text>
                        <Text style={styles.subtitle}>
                            {t('more.aiSubtitle')}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>{t('more.online')}</Text>
                    </View>
                </View>

                {/* Messages */}
                <ScrollView
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map((msg) => (
                        <View
                            key={msg.id}
                            style={[
                                styles.messageRow,
                                msg.type === 'user' && styles.messageRowUser,
                            ]}
                        >
                            <View
                                style={[
                                    styles.avatar,
                                    {
                                        backgroundColor: msg.type === 'bot'
                                            ? '#6366F1'
                                            : theme.card,
                                    },
                                ]}
                            >
                                <Ionicons
                                    name={msg.type === 'bot' ? 'sparkles' : 'person'}
                                    size={18}
                                    color="#fff"
                                />
                            </View>
                            <View
                                style={[
                                    styles.messageBubble,
                                    msg.type === 'bot'
                                        ? { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }
                                        : { backgroundColor: '#6366F1' },
                                ]}
                            >
                                <Text style={[styles.messageText, { color: '#fff' }]}>
                                    {msg.text}
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Suggestions */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.suggestionsContent}
                    style={styles.suggestionsContainer}
                >
                    {suggestions.map((s, i) => (
                        <Pressable
                            key={i}
                            style={[styles.suggestionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                        >
                            <Text style={[styles.suggestionLabel, { color: s.color }]}>
                                {s.label}
                            </Text>
                            <Text style={[styles.suggestionText, { color: theme.text }]} numberOfLines={2}>
                                {s.text}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* Input */}
                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder={t('more.aiPlaceholder')}
                        placeholderTextColor={theme.muted}
                        value={inputText}
                        onChangeText={setInputText}
                    />
                    <Pressable style={styles.sendButton}>
                        <Ionicons name="send" size={18} color="#fff" />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginTop: 40,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
        marginTop: 4,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#10B981',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        gap: 16,
    },
    messageRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-end',
    },
    messageRowUser: {
        flexDirection: 'row-reverse',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 14,
        borderRadius: 18,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
    },
    suggestionsContainer: {
        maxHeight: 90,
        marginBottom: 12,
    },
    suggestionsContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    suggestionCard: {
        width: 200,
        padding: 14,
        borderRadius: 18,
        borderWidth: 1,
    },
    suggestionLabel: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 6,
    },
    suggestionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: Platform.OS === 'ios' ? 40 : 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        paddingVertical: 10,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
