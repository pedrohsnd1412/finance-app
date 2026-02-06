import AccountsList from '@/components/AccountsList';
import { Container } from '@/components/Container';
import { GlassCard } from '@/components/GlassCard';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BanksScreen() {
    const { t } = useTranslation();
    const { isDesktop } = useResponsive();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    return (
        <Container>
            <View style={styles.header}>
                {!isDesktop ? (
                    <View>
                        <Text style={styles.mobileTitle}>{t('tabs.banks')}</Text>
                        <Text style={styles.mobileSubtitle}>{t('banks.connectedAccountsSubtitle')}</Text>
                    </View>
                ) : (
                    <Text style={[styles.desktopTitle, { color: theme.text }]}>
                        {t('tabs.banks')}
                    </Text>
                )}
                <TouchableOpacity
                    style={[styles.connectButton, { backgroundColor: '#6366f1' }]}
                    onPress={() => {
                        router.push('/more');
                    }}
                >
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <GlassCard style={styles.infoBox}>
                    <View style={styles.infoIcon}>
                        <Ionicons name="shield-checkmark-outline" size={32} color="#6366f1" />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.secureTitle}>{t('banks.secureConnectionTitle')}</Text>
                        <Text style={styles.secureDesc}>{t('banks.secureConnectionDesc')}</Text>
                    </View>
                </GlassCard>

                <View style={{ marginTop: 8 }}>
                    <AccountsList />
                </View>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 8,
    },
    mobileTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    mobileSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '600',
        marginTop: 2,
    },
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 0,
    },
    connectButton: {
        width: 52,
        height: 52,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    content: {
        flex: 1,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        marginBottom: 32,
        gap: 20,
    },
    infoIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)',
    },
    infoTextContainer: {
        flex: 1,
        gap: 4,
    },
    secureTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    secureDesc: {
        fontSize: 14,
        lineHeight: 20,
        color: '#94A3B8',
        fontWeight: '500',
    },
});
