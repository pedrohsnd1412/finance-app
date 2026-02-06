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
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function BanksScreen() {
    const { t } = useTranslation();
    const { isDesktop } = useResponsive();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();

    return (
        <Container>
            <View style={styles.content}>
                {/* Full Width Security Banner */}
                <GlassCard style={styles.infoBox}>
                    <View style={styles.infoIcon}>
                        <Ionicons name="shield-checkmark-outline" size={32} color="#6366f1" />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.secureTitle}>{t('banks.secureConnectionTitle')}</Text>
                        <Text style={styles.secureDesc}>{t('banks.secureConnectionDesc')}</Text>
                    </View>
                    {!isDesktop && (
                        <TouchableOpacity
                            style={[styles.connectButton, { backgroundColor: '#6366f1' }]}
                            onPress={() => router.push('/more')}
                        >
                            <Ionicons name="add" size={24} color="#fff" />
                        </TouchableOpacity>
                    )}
                </GlassCard>

                <View style={styles.sectionsGrid}>
                    <View style={styles.accountSection}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionTitle}>Contas Correntes</Text>
                            <View style={styles.badge}><Text style={styles.badgeText}>Ativas</Text></View>
                        </View>
                        <AccountsList filter="debit" hideHeader={true} />
                    </View>

                    <View style={styles.accountSection}>
                        <View style={styles.sectionTitleRow}>
                            <Text style={styles.sectionTitle}>Cartões de Crédito</Text>
                            <View style={styles.badge}><Text style={styles.badgeText}>Gestão</Text></View>
                        </View>
                        <AccountsList filter="credit" hideHeader={true} />
                    </View>
                </View>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingTop: 8,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 32,
        marginBottom: 32,
        gap: 24,
        width: '100%',
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
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    secureDesc: {
        fontSize: 15,
        lineHeight: 22,
        color: '#94A3B8',
        fontWeight: '500',
    },
    sectionsGrid: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        gap: 32,
    },
    accountSection: {
        flex: 1,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    badge: {
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeText: {
        color: '#6366f1',
        fontSize: 10,
        fontWeight: '700',
    },
    connectButton: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
