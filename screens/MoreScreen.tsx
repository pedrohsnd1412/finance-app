import AccountsList from '@/components/AccountsList';
import { Container } from '@/components/Container';
import { GlassCard } from '@/components/GlassCard';
import PluggyConnect from '@/components/PluggyConnect';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
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

type TabKey = 'settings' | 'accounts' | 'help';

interface TabItem {
    key: TabKey;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabItem[] = [
    { key: 'settings', label: 'tabs.settings', icon: 'settings-outline' },
    { key: 'accounts', label: 'tabs.banks', icon: 'wallet-outline' },
    { key: 'help', label: 'tabs.help', icon: 'help-circle-outline' },
];

export default function MoreScreen() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabKey>('settings');
    const colorScheme = useColorScheme();
    const { toggleTheme } = useTheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { isDesktop } = useResponsive();
    const { user, signOut } = useAuth();
    const [showConnectModal, setShowConnectModal] = useState(false);

    const handleConnectSuccess = (itemData: any) => {
        setShowConnectModal(false);
        Alert.alert(t('common.success'), t('common.connectSuccess'));
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
            <View style={styles.tabBar}>
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <Pressable
                            key={tab.key}
                            style={[
                                styles.tab,
                                isActive && { backgroundColor: theme.card }
                            ]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Ionicons
                                name={tab.icon}
                                size={18}
                                color={isActive ? theme.text : theme.muted}
                            />
                            <Text
                                style={[
                                    styles.tabLabel,
                                    { color: isActive ? theme.text : theme.muted },
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
                <GlassCard style={styles.userCard}>
                    <View style={styles.userAvatar}>
                        <Ionicons name="person" size={28} color="#fff" />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={[styles.userEmail, { color: theme.text }]}>
                            {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}
                        </Text>
                        <Text style={styles.userIdText}>
                            {user.email}
                        </Text>
                        <Text style={styles.userLabel}>
                            {t('more.accountActive')}
                        </Text>
                    </View>
                </GlassCard>
            )}


            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {t('more.preferences')}
                </Text>

                {[
                    { icon: 'notifications-outline', label: t('more.notifications'), value: t('more.statusActive'), action: undefined },
                    { icon: 'moon-outline', label: t('more.theme'), value: colorScheme === 'dark' ? t('more.statusDark') : t('more.statusLight'), action: toggleTheme },
                    { icon: 'language-outline', label: t('more.language'), value: i18n.language === 'pt' ? t('languages.pt') : t('languages.en'), action: toggleLanguage },
                    { icon: 'lock-closed-outline', label: t('more.privacy'), value: '', action: undefined },
                ].map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.settingsItem, { backgroundColor: theme.card, borderColor: theme.border }]}
                        onPress={item.action}
                    >
                        <View style={styles.settingsIconBox}>
                            <Ionicons name={item.icon as any} size={20} color="#6366F1" />
                        </View>
                        <Text style={[styles.settingsLabel, { color: theme.text }]}>
                            {item.label}
                        </Text>
                        <Text style={styles.settingsValue}>
                            {item.value}
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {t('more.account')}
                </Text>

                {[
                    { icon: 'person-outline', label: t('more.profile'), action: undefined },
                    { icon: 'shield-checkmark-outline', label: t('more.security'), action: undefined },
                    { icon: 'document-text-outline', label: t('more.terms'), action: undefined },
                ].map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.settingsItem, { backgroundColor: theme.card, borderColor: theme.border }]}
                        onPress={item.action}
                    >
                        <View style={styles.settingsIconBox}>
                            <Ionicons name={item.icon as any} size={20} color="#6366F1" />
                        </View>
                        <Text style={[styles.settingsLabel, { color: theme.text }]}>
                            {item.label}
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                ))}

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.settingsItem, styles.logoutButton]}
                    onPress={handleLogout}
                >
                    <View style={[styles.settingsIconBox, { backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}>
                        <Ionicons name="log-out-outline" size={20} color="#F43F5E" />
                    </View>
                    <Text style={[styles.settingsLabel, { color: '#F43F5E' }]}>
                        {t('common.logout')}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#F43F5E" style={{ opacity: 0.3 }} />
                </TouchableOpacity>
            </View>
        </ScrollView >
    );

    const renderAccounts = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {t('more.connectedAccounts')}
                </Text>

                {/* Connect Account Button */}
                <TouchableOpacity
                    style={styles.addCard}
                    onPress={() => setShowConnectModal(true)}
                >
                    <View style={styles.addIconContainer}>
                        <Ionicons name="add" size={28} color="#fff" />
                    </View>
                    <View style={styles.addCardText}>
                        <Text style={[styles.addCardTitle, { color: theme.text }]}>
                            {t('more.connectNew')}
                        </Text>
                        <Text style={[styles.addCardSubtitle, { color: theme.muted }]}>
                            {t('more.connectNewSubtitle')}
                        </Text>
                    </View>
                </TouchableOpacity>

                <AccountsList />
            </View>
        </ScrollView>
    );

    const renderHelp = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    {t('more.helpCenter')}
                </Text>

                {[
                    { icon: 'help-circle-outline', label: t('more.faq') },
                    { icon: 'chatbubble-outline', label: t('more.contact') },
                    { icon: 'book-outline', label: t('more.tutorial') },
                    { icon: 'information-circle-outline', label: t('more.about') },
                ].map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.settingsItem, { backgroundColor: theme.card, borderColor: theme.border }]}
                    >
                        <View style={styles.settingsIconBox}>
                            <Ionicons name={item.icon as any} size={20} color="#6366F1" />
                        </View>
                        <Text style={[styles.settingsLabel, { color: theme.text }]}>
                            {item.label}
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.version}>
                <Text style={styles.versionText}>
                    Dignos AI v1.0.0
                </Text>
            </View>
        </ScrollView>
    );

    return (
        <Container style={styles.container}>
            <View style={styles.header}>
                {!isDesktop ? (
                    <View>
                        <Text style={[styles.mobileTitle, { color: theme.text }]}>{t('tabs.more')}</Text>
                        <Text style={styles.mobileSubtitle}>{t('more.subtitle')}</Text>
                    </View>
                ) : (
                    <Text style={[styles.desktopTitle, { color: theme.text }]}>
                        {t('tabs.more')}
                    </Text>
                )}
            </View>

            <View style={{ paddingHorizontal: 16, flex: 1 }}>
                {renderTabBar()}
                {activeTab === 'settings' && renderSettings()}
                {activeTab === 'accounts' && renderAccounts()}
                {activeTab === 'help' && renderHelp()}
            </View>

            <Modal
                visible={showConnectModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowConnectModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{t('more.connectModalTitle')}</Text>
                            <TouchableOpacity onPress={() => setShowConnectModal(false)} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#FFFFFF" />
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
    container: {
        paddingHorizontal: 0,
    },
    header: {
        paddingHorizontal: 16,
        marginBottom: 32,
        marginTop: 40, // increased from 8
    },
    mobileTitle: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    mobileSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
        marginTop: 4,
    },
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 24,
    },
    tabContainer: {
        marginBottom: 24,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 20,
        padding: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 16,
    },
    tabActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    tabLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        marginBottom: 32,
        gap: 20,
    },
    userAvatar: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    userInfo: {
        flex: 1,
        gap: 2,
    },
    userEmail: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    userIdText: {
        fontSize: 10,
        color: '#94A3B8',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    userLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#10B981',
        marginTop: 4,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    addCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderRadius: 28,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        marginBottom: 24,
        gap: 20,
    },
    addIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 18,
        backgroundColor: '#6366F1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addCardText: {
        flex: 1,
        gap: 4,
    },
    addCardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    addCardSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
        lineHeight: 20,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        marginBottom: 12,
        gap: 16,
    },
    settingsIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingsLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    settingsValue: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
    },
    logoutButton: {
        marginTop: 16,
        backgroundColor: 'rgba(244, 63, 94, 0.05)',
        borderColor: 'rgba(244, 63, 94, 0.1)',
    },
    version: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    versionText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        width: '100%',
        height: '92%',
        backgroundColor: '#0d0d12',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
    },
    modalHeader: {
        padding: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});


