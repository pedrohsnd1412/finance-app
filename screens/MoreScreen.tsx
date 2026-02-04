import AccountsList from '@/components/AccountsList';
import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import PluggyConnect from '@/components/PluggyConnect';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import i18n from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type TabKey = 'settings' | 'help';

interface TabItem {
    key: TabKey;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
    { key: 'settings', label: 'tabs.settings', icon: 'settings-outline' },
    { key: 'help', label: 'tabs.help', icon: 'help-circle-outline' },
];

export default function MoreScreen() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabKey>('settings');
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { user, signOut } = useAuth();
    const [showConnectModal, setShowConnectModal] = useState(false);

    const handleConnectSuccess = (itemData: any) => {
        setShowConnectModal(false);
        Alert.alert('Sucesso', 'Conta conectada com sucesso!');
    };

    const handleConnectError = (error: any) => {
        console.error("Connect error:", error);
    };

    const handleLogout = async () => {
        const confirmLogout = () => {
            return new Promise<boolean>((resolve) => {
                if (Platform.OS === 'web') {
                    resolve(window.confirm(t('common.logout') + '?'));
                } else {
                    Alert.alert(
                        t('common.logout'),
                        t('common.logout') + '?',
                        [
                            { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
                            { text: t('common.logout'), style: 'destructive', onPress: () => resolve(true) },
                        ]
                    );
                }
            });
        };

        const confirmed = await confirmLogout();
        if (confirmed) {
            await signOut();
        }
    };

    const toggleLanguage = () => {
        const nextLang = i18n.language === 'pt' ? 'en' : 'pt';
        i18n.changeLanguage(nextLang);
    };

    const renderTabBar = () => (
        <View style={styles.tabContainer}>
            <View style={[styles.tabBar, { backgroundColor: 'rgba(0,0,0,0.03)' }]}>
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <Pressable
                            key={tab.key}
                            style={[
                                styles.tab,
                                isActive && styles.tabActive,
                                isActive && { backgroundColor: theme.card }
                            ]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={18}
                                color={isActive ? theme.tint : theme.muted}
                            />
                            <Text
                                style={[
                                    styles.tabLabel,
                                    { color: isActive ? theme.tint : theme.muted },
                                ]}
                            >
                                {t(tab.label)}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );

    const renderSettings = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* User Info */}
            {user && (
                <View style={StyleSheet.flatten([styles.userCard, { backgroundColor: theme.card }])}>
                    <View style={StyleSheet.flatten([styles.userAvatar, { backgroundColor: theme.tint }])}>
                        <Ionicons name="person" size={28} color="#fff" />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={StyleSheet.flatten([styles.userEmail, { color: theme.text }])}>
                            {user.email}
                        </Text>
                        <Text style={{ fontSize: 10, color: theme.text, opacity: 0.4, marginTop: 2 }}>
                            ID: {user.id}
                        </Text>
                        <Text style={StyleSheet.flatten([styles.userLabel, { color: theme.text, opacity: 0.5 }])}>
                            Conta ativa
                        </Text>
                    </View>
                </View>
            )}

            <View style={styles.section}>
                <Text style={StyleSheet.flatten([styles.sectionTitle, { color: theme.text }])}>
                    Contas Conectadas
                </Text>

                {/* Connect Account Button */}
                <Pressable
                    style={StyleSheet.flatten([styles.addCard, { borderColor: theme.tint, backgroundColor: theme.tint + '10' }])}
                    onPress={() => setShowConnectModal(true)}
                >
                    <View style={StyleSheet.flatten([styles.addIconContainer, { backgroundColor: theme.tint }])}>
                        <Ionicons name="add" size={28} color="#fff" />
                    </View>
                    <View style={styles.addCardText}>
                        <Text style={StyleSheet.flatten([styles.addCardTitle, { color: theme.text }])}>
                            Conectar Nova Conta
                        </Text>
                        <Text style={StyleSheet.flatten([styles.addCardSubtitle, { color: theme.text, opacity: 0.6 }])}>
                            Sincronize seus dados bancários
                        </Text>
                    </View>
                </Pressable>

                <AccountsList />
            </View>

            <View style={styles.section}>
                <Text style={StyleSheet.flatten([styles.sectionTitle, { color: theme.text }])}>
                    {t('more.preferences')}
                </Text>

                {[
                    { icon: 'notifications-outline', label: t('more.notifications'), value: 'Ativadas', action: undefined },
                    { icon: 'moon-outline', label: t('more.theme'), value: colorScheme === 'dark' ? 'Escuro' : 'Claro', action: undefined },
                    { icon: 'language-outline', label: t('more.language'), value: i18n.language === 'pt' ? 'Português' : 'English', action: toggleLanguage },
                    { icon: 'lock-closed-outline', label: t('more.privacy'), value: '', action: undefined },
                ].map((item, index) => (
                    <Pressable
                        key={index}
                        style={StyleSheet.flatten([styles.settingsItem, { backgroundColor: theme.card }])}
                        onPress={item.action}
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
                    {t('more.account')}
                </Text>

                {[
                    { icon: 'person-outline', label: t('more.profile'), action: undefined },
                    { icon: 'shield-checkmark-outline', label: t('more.security'), action: undefined },
                    { icon: 'document-text-outline', label: t('more.terms'), action: undefined },
                ].map((item, index) => (
                    <Pressable
                        key={index}
                        style={StyleSheet.flatten([styles.settingsItem, { backgroundColor: theme.card }])}
                        onPress={item.action}
                    >
                        <Ionicons name={item.icon as any} size={22} color={theme.tint} />
                        <Text style={StyleSheet.flatten([styles.settingsLabel, { color: theme.text }])}>
                            {item.label}
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color={theme.text} style={{ opacity: 0.3 }} />
                    </Pressable>
                ))}

                {/* Logout Button */}
                <Pressable
                    style={StyleSheet.flatten([styles.settingsItem, styles.logoutButton, { backgroundColor: theme.error + '10' }])}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={22} color={theme.error} />
                    <Text style={StyleSheet.flatten([styles.settingsLabel, { color: theme.error }])}>
                        {t('common.logout')}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={theme.error} style={{ opacity: 0.3 }} />
                </Pressable>
            </View>
        </ScrollView>
    );

    const renderHelp = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
                <Text style={StyleSheet.flatten([styles.sectionTitle, { color: theme.text }])}>
                    {t('more.helpCenter')}
                </Text>

                {[
                    { icon: 'help-circle-outline', label: t('more.faq') },
                    { icon: 'chatbubble-outline', label: t('more.contact') },
                    { icon: 'book-outline', label: t('more.tutorial') },
                    { icon: 'information-circle-outline', label: t('more.about') },
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
                    DignusAI v1.0.0
                </Text>
            </View>
        </ScrollView>
    );

    return (
        <Container>
            <Header title={t('tabs.more')} />
            {renderTabBar()}
            {activeTab === 'settings' && renderSettings()}
            {activeTab === 'help' && renderHelp()}

            <Modal
                visible={showConnectModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowConnectModal(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{
                        width: Platform.OS === 'web' ? '50%' : '90%',
                        height: Platform.OS === 'web' ? '70%' : '80%',
                        backgroundColor: theme.card,
                        borderRadius: 20,
                        overflow: 'hidden',
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                    }}>
                        <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.tint + '10' }}>
                            <Text style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: theme.text, marginLeft: 8 }}>Conectar Conta</Text>
                            <TouchableOpacity onPress={() => setShowConnectModal(false)} style={{ padding: 4 }}>
                                <Ionicons name="close-circle" size={24} color={theme.muted} />
                            </TouchableOpacity>
                        </View>
                        <PluggyConnect
                            onSuccess={handleConnectSuccess}
                            onError={handleConnectError}
                            onClose={() => setShowConnectModal(false)}
                        />
                    </View>
                </View>
            </Modal>
        </Container>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        marginBottom: 24,
    },
    tabBar: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 5,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 12,
    },
    tabActive: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tabLabel: {
        fontSize: 13,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        paddingVertical: 48,
        alignItems: 'center',
    },
    // Stats Row
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    statValue: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -1,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Add Connection Card
    addCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        borderWidth: 2,
        borderStyle: 'dashed',
        marginBottom: 24,
        gap: 16,
    },
    addIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addCardText: {
        flex: 1,
        gap: 4,
    },
    addCardTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    addCardSubtitle: {
        fontSize: 14,
        lineHeight: 18,
    },
    // User Card
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        marginBottom: 24,
        gap: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    userAvatar: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInfo: {
        flex: 1,
        gap: 4,
    },
    userEmail: {
        fontSize: 17,
        fontWeight: '700',
    },
    userLabel: {
        fontSize: 13,
        fontWeight: '500',
    },
    // Sections
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // Settings Items
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 20,
        marginBottom: 10,
        gap: 14,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    settingsLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
    },
    settingsValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    logoutButton: {
        marginTop: 16,
        borderWidth: 0,
    },
    // Version
    version: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    versionText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
