import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export default function CardsScreen() {
    const { t } = useTranslation();
    const { isDesktop } = useResponsive();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <Container>
            <Header title={t('tabs.cards')} />
            {isDesktop && (
                <Text style={[styles.desktopTitle, { color: theme.text }]}>
                    {t('tabs.cards')}
                </Text>
            )}
            <View style={styles.placeholder}>
                <Text style={[styles.text, { color: theme.muted }]}>{t('cards.description')}</Text>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        opacity: 0.6,
    },
    text: {
        textAlign: 'center',
        fontSize: 16,
    },
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 24,
        marginTop: 8,
    },
});
