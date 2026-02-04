import AccountsList from '@/components/AccountsList';
import { Container } from '@/components/Container';
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
                {isDesktop && (
                    <Text style={[styles.desktopTitle, { color: theme.text }]}>
                        {t('tabs.banks')}
                    </Text>
                )}
                <TouchableOpacity
                    style={[styles.connectButton, { backgroundColor: theme.tint }]}
                    onPress={() => {
                        // For now we can navigate to more screen where the connect modal is, 
                        // or we could implement the modal here too.
                        // Given the request for "integration", I'll keep it simple for now.
                        router.push('/more');
                    }}
                >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.connectButtonText}>{t('more.connectNew')}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={[styles.infoBox, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
                    <View style={[styles.infoIcon, { backgroundColor: theme.tint + '10' }]}>
                        <Ionicons name="shield-checkmark-outline" size={22} color={theme.tint} />
                    </View>
                    <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoTitle, { color: theme.text }]}>{t('more.security')}</Text>
                        <Text style={[styles.infoText, { color: theme.muted }]}>
                            {t('banks.manageInfo')}
                        </Text>
                    </View>
                </View>

                <AccountsList />
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
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 0,
    },
    connectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        gap: 8,
    },
    connectButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderRadius: 24,
        marginBottom: 32,
        gap: 20,
    },
    infoIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoTextContainer: {
        flex: 1,
        gap: 4,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    infoText: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
    },
});
