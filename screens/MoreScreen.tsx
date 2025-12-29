import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type TabKey = 'connections' | 'settings' | 'help';

interface TabItem {
    key: TabKey;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
    { key: 'connections', label: 'Conexões', icon: 'link-outline' },
    { key: 'settings', label: 'Configurações', icon: 'settings-outline' },
    { key: 'help', label: 'Ajuda', icon: 'help-circle-outline' },
];

interface Connection {
    id: string;
    connector_name: string | null;
    status: string;
    last_synced_at: string | null;
}

export default function MoreScreen() {
    const [activeTab, setActiveTab] = useState<TabKey>('connections');
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const [connections, setConnections] = useState<Connection[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadConnections();
    }, []);

    const loadConnections = async () => {
        setIsLoading(true);
        try {
            const { data } = await supabase
                .from('connections')
                .select('id, connector_name, status, last_synced_at')
                .order('created_at', { ascending: false });

            setConnections(data || []);
        } catch (error) {
            console.log('No connections:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderTabBar = () => (
        <View style={StyleSheet.flatten([styles.tabBar, { borderBottomColor: theme.border }])}>
            {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <Pressable
                        key={tab.key}
                        style={StyleSheet.flatten([
                            styles.tab,
                            isActive && { borderBottomColor: theme.tint, borderBottomWidth: 2 },
                        ])}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <Ionicons
                            name={tab.icon}
                            size={20}
                            color={isActive ? theme.tint : theme.text}
                            style={{ opacity: isActive ? 1 : 0.5 }}
                        />
                        <Text
                            style={StyleSheet.flatten([
                                styles.tabLabel,
                                { color: isActive ? theme.tint : theme.text },
                                !isActive && { opacity: 0.5 },
                            ])}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );

    const renderConnections = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Add New Connection Card */}
            <Pressable
                style={StyleSheet.flatten([styles.addCard, { backgroundColor: theme.tint + '15', borderColor: theme.tint }])}
                onPress={() => router.push('/connect')}
            >
                <View style={StyleSheet.flatten([styles.addIconContainer, { backgroundColor: theme.tint }])}>
                    <Ionicons name="add" size={24} color="#fff" />
                </View>
                <View style={styles.addCardText}>
                    <Text style={StyleSheet.flatten([styles.addCardTitle, { color: theme.text }])}>
                        Conectar Nova Conta
                    </Text>
                    <Text style={StyleSheet.flatten([styles.addCardSubtitle, { color: theme.text, opacity: 0.7 }])}>
                        Vincule sua conta bancária via Open Finance
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.tint} />
            </Pressable>

            {/* Existing Connections */}
            {connections.length > 0 && (
                <View style={styles.section}>
                    <Text style={StyleSheet.flatten([styles.sectionTitle, { color: theme.text }])}>
                        Contas Conectadas
                    </Text>
                    {connections.map((connection) => (
                        <View
                            key={connection.id}
                            style={StyleSheet.flatten([styles.connectionCard, { backgroundColor: theme.card }])}
                        >
                            <View style={StyleSheet.flatten([styles.bankIcon, { backgroundColor: theme.tint + '20' }])}>
                                <Ionicons name="business-outline" size={24} color={theme.tint} />
                            </View>
                            <View style={styles.connectionInfo}>
                                <Text style={StyleSheet.flatten([styles.connectionName, { color: theme.text }])}>
                                    {connection.connector_name || 'Conta Bancária'}
                                </Text>
                                <View style={styles.statusRow}>
                                    <View style={StyleSheet.flatten([
                                        styles.statusDot,
                                        { backgroundColor: connection.status === 'UPDATED' ? theme.success : theme.warning }
                                    ])} />
                                    <Text style={StyleSheet.flatten([styles.statusText, { color: theme.text, opacity: 0.6 }])}>
                                        {connection.status === 'UPDATED' ? 'Sincronizado' :
                                            connection.status === 'PENDING' ? 'Pendente' :
                                                connection.status === 'UPDATING' ? 'Atualizando...' : 'Erro'}
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="ellipsis-vertical" size={20} color={theme.text} style={{ opacity: 0.4 }} />
                        </View>
                    ))}
                </View>
            )}

            {/* Empty State */}
            {connections.length === 0 && !isLoading && (
                <View style={styles.emptyState}>
                    <Ionicons name="wallet-outline" size={48} color={theme.text} style={{ opacity: 0.3 }} />
                    <Text style={StyleSheet.flatten([styles.emptyText, { color: theme.text, opacity: 0.5 }])}>
                        Nenhuma conta conectada ainda
                    </Text>
                </View>
            )}
        </ScrollView>
    );

    const renderSettings = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
                <Text style={StyleSheet.flatten([styles.sectionTitle, { color: theme.text }])}>
                    Preferências
                </Text>

                {[
                    { icon: 'notifications-outline', label: 'Notificações', value: 'Ativadas' },
                    { icon: 'moon-outline', label: 'Tema', value: colorScheme === 'dark' ? 'Escuro' : 'Claro' },
                    { icon: 'language-outline', label: 'Idioma', value: 'Português' },
                    { icon: 'lock-closed-outline', label: 'Privacidade', value: '' },
                ].map((item, index) => (
                    <Pressable
                        key={index}
                        style={StyleSheet.flatten([styles.settingsItem, { backgroundColor: theme.card }])}
                    >
                        <Ionicons name={item.icon as any} size={22} color={theme.tint} />
                        <Text style={StyleSheet.flatten([styles.settingsLabel, { color: theme.text }])}>
                            {item.label}
                        </Text>
                        <Text style={StyleSheet.flatten([styles.settingsValue, { color: theme.text, opacity: 0.5 }])}>
                            {item.value}
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color={theme.text} style={{ opacity: 0.3 }} />
                    </Pressable>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={StyleSheet.flatten([styles.sectionTitle, { color: theme.text }])}>
                    Conta
                </Text>

                {[
                    { icon: 'person-outline', label: 'Meu Perfil' },
                    { icon: 'shield-checkmark-outline', label: 'Segurança' },
                    { icon: 'document-text-outline', label: 'Termos de Uso' },
                    { icon: 'log-out-outline', label: 'Sair', danger: true },
                ].map((item, index) => (
                    <Pressable
                        key={index}
                        style={StyleSheet.flatten([styles.settingsItem, { backgroundColor: theme.card }])}
                    >
                        <Ionicons
                            name={item.icon as any}
                            size={22}
                            color={item.danger ? theme.error : theme.tint}
                        />
                        <Text style={StyleSheet.flatten([
                            styles.settingsLabel,
                            { color: item.danger ? theme.error : theme.text }
                        ])}>
                            {item.label}
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color={theme.text} style={{ opacity: 0.3 }} />
                    </Pressable>
                ))}
            </View>
        </ScrollView>
    );

    const renderHelp = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
                <Text style={StyleSheet.flatten([styles.sectionTitle, { color: theme.text }])}>
                    Central de Ajuda
                </Text>

                {[
                    { icon: 'help-circle-outline', label: 'Perguntas Frequentes' },
                    { icon: 'chatbubble-outline', label: 'Fale Conosco' },
                    { icon: 'book-outline', label: 'Tutorial do App' },
                    { icon: 'information-circle-outline', label: 'Sobre o App' },
                ].map((item, index) => (
                    <Pressable
                        key={index}
                        style={StyleSheet.flatten([styles.settingsItem, { backgroundColor: theme.card }])}
                    >
                        <Ionicons name={item.icon as any} size={22} color={theme.tint} />
                        <Text style={StyleSheet.flatten([styles.settingsLabel, { color: theme.text }])}>
                            {item.label}
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color={theme.text} style={{ opacity: 0.3 }} />
                    </Pressable>
                ))}
            </View>

            <View style={styles.version}>
                <Text style={StyleSheet.flatten([styles.versionText, { color: theme.text, opacity: 0.3 }])}>
                    Finance App v1.0.0
                </Text>
            </View>
        </ScrollView>
    );

    return (
        <Container>
            <Header title="Mais" />
            {renderTabBar()}
            {activeTab === 'connections' && renderConnections()}
            {activeTab === 'settings' && renderSettings()}
            {activeTab === 'help' && renderHelp()}
        </Container>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        marginBottom: 16,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
    },
    tabLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    // Add Connection Card
    addCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginBottom: 24,
        gap: 12,
    },
    addIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addCardText: {
        flex: 1,
        gap: 2,
    },
    addCardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    addCardSubtitle: {
        fontSize: 13,
    },
    // Sections
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        opacity: 0.6,
    },
    // Connection Cards
    connectionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    bankIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    connectionInfo: {
        flex: 1,
        gap: 4,
    },
    connectionName: {
        fontSize: 16,
        fontWeight: '600',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
    },
    // Settings Items
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        gap: 12,
    },
    settingsLabel: {
        flex: 1,
        fontSize: 16,
    },
    settingsValue: {
        fontSize: 14,
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
    // Version
    version: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    versionText: {
        fontSize: 12,
    },
});
