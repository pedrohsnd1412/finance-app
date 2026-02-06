import { Container } from '@/components/Container';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export default function CardsScreen() {
    const { t } = useTranslation();
    const { isDesktop } = useResponsive();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <Container style={styles.container}>
            <View style={styles.header}>
                {!isDesktop ? (
                    <View>
                        <Text style={styles.mobileTitle}>{t('tabs.cards')}</Text>
                        <Text style={styles.mobileSubtitle}>{t('cards.subtitle')}</Text>
                    </View>
                ) : (
                    <Text style={[styles.desktopTitle, { color: theme.text }]}>
                        {t('tabs.cards')}
                    </Text>
                )}
            </View>

            <View style={styles.placeholder}>
                <Ionicons name="card-outline" size={64} color="#94A3B8" style={{ opacity: 0.2 }} />
                <Text style={styles.text}>{t('cards.description')}</Text>
            </View>
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
        marginTop: 4,
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        gap: 24,
    },
    text: {
        textAlign: 'center',
        fontSize: 16,
        color: '#94A3B8',
        lineHeight: 24,
        fontWeight: '500',
    },
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 24,
    },
});
