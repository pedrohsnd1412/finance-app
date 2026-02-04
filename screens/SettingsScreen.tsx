import { Container } from '@/components/Container';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
    const { t, i18n } = useTranslation();
    const { isDesktop } = useResponsive();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const currentLanguage = i18n.language;

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Container>
            {isDesktop && (
                <Text style={[styles.desktopTitle, { color: theme.text }]}>
                    {t('more.preferences')}
                </Text>
            )}

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('more.language')}</Text>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <TouchableOpacity
                        style={[styles.option, currentLanguage === 'pt' && styles.selectedOption]}
                        onPress={() => changeLanguage('pt')}
                    >
                        <View style={styles.optionInfo}>
                            <Text style={[styles.optionLabel, { color: theme.text }]}>{t('languages.pt')}</Text>
                            <Text style={[styles.optionDesc, { color: theme.muted }]}>{t('settings.langSubtitle')}</Text>
                        </View>
                        {currentLanguage === 'pt' && <Ionicons name="checkmark-circle" size={24} color={theme.tint} />}
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <TouchableOpacity
                        style={[styles.option, currentLanguage === 'en' && styles.selectedOption]}
                        onPress={() => changeLanguage('en')}
                    >
                        <View style={styles.optionInfo}>
                            <Text style={[styles.optionLabel, { color: theme.text }]}>{t('languages.en')}</Text>
                            <Text style={[styles.optionDesc, { color: theme.muted }]}>{t('settings.langSubtitle')}</Text>
                        </View>
                        {currentLanguage === 'en' && <Ionicons name="checkmark-circle" size={24} color={theme.tint} />}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('more.theme')}</Text>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={styles.option}>
                        <View style={styles.optionInfo}>
                            <Text style={[styles.optionLabel, { color: theme.text }]}>{t('more.profile')}</Text>
                            <Text style={[styles.optionDesc, { color: theme.muted }]}>{t('settings.themeSubtitle')}</Text>
                        </View>
                        <Ionicons name="moon-outline" size={24} color={theme.muted} />
                    </View>
                </View>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    desktopTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 24,
        marginTop: 8,
    },
    section: {
        marginBottom: 32,
        maxWidth: 600,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        opacity: 0.6,
    },
    card: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        justifyContent: 'space-between',
    },
    selectedOption: {
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
    },
    optionInfo: {
        flex: 1,
        gap: 4,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    optionDesc: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        marginHorizontal: 20,
    },
});
