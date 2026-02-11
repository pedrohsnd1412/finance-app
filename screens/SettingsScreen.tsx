import { Container } from '@/components/Container';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { useConnections } from '@/hooks/useConnections';
import { useDeleteUserData } from '@/hooks/useDeleteUserData';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
    const { t, i18n } = useTranslation();
    const { isDesktop } = useResponsive();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { connections, isLoading: isLoadingConnections } = useConnections();
    const { deleteAllData, isDeleting } = useDeleteUserData();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');

    const currentLanguage = i18n.language;

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const handleDeleteData = async () => {
        const deleteWord = currentLanguage === 'pt' ? 'EXCLUIR' : 'DELETE';

        if (confirmText !== deleteWord) {
            Alert.alert(
                t('common.error'),
                t('settings.typeDeleteToConfirm')
            );
            return;
        }

        const result = await deleteAllData();

        if (result.success) {
            setShowDeleteModal(false);
            setConfirmText('');
            Alert.alert(
                t('common.success'),
                t('settings.dataDeleted')
            );
        } else {
            Alert.alert(
                t('common.error'),
                t('settings.deleteError')
            );
        }
    };

    return (
        <Container>
            {isDesktop && (
                <View style={styles.titleSection}>
                    <Text style={[styles.desktopTitle, { color: theme.text }]}>
                        {t('more.preferences')}
                    </Text>
                    <Text style={styles.pageSubtitle}>Personalize sua experiência no aplicativo</Text>
                </View>
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

            {/* Data & Privacy Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('settings.dataPrivacy')}</Text>

                {/* Connected Banks */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 12 }]}>
                    <View style={styles.option}>
                        <View style={styles.optionInfo}>
                            <Text style={[styles.optionLabel, { color: theme.text }]}>{t('settings.connectedBanks')}</Text>
                            {isLoadingConnections ? (
                                <ActivityIndicator size="small" color={theme.muted} />
                            ) : (
                                <Text style={[styles.optionDesc, { color: theme.muted }]}>
                                    {connections.length > 0
                                        ? `${connections.length} ${connections.length === 1 ? 'banco conectado' : 'bancos conectados'}`
                                        : t('settings.noBanksConnected')
                                    }
                                </Text>
                            )}
                        </View>
                        <Ionicons name="business-outline" size={24} color={theme.muted} />
                    </View>
                </View>

                {/* Delete All Data */}
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: '#ef4444' }]}>
                    <TouchableOpacity
                        style={styles.option}
                        onPress={() => setShowDeleteModal(true)}
                        disabled={isDeleting}
                    >
                        <View style={styles.optionInfo}>
                            <Text style={[styles.optionLabel, { color: '#ef4444' }]}>{t('settings.deleteAllData')}</Text>
                            <Text style={[styles.optionDesc, { color: theme.muted }]}>{t('settings.deleteDataDesc')}</Text>
                            <Text style={[styles.warningText, { color: '#f59e0b' }]}>{t('settings.deleteDataWarning')}</Text>
                        </View>
                        {isDeleting ? (
                            <ActivityIndicator size="small" color="#ef4444" />
                        ) : (
                            <Ionicons name="trash-outline" size={24} color="#ef4444" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="warning" size={48} color="#ef4444" />
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                {t('settings.confirmDeleteTitle')}
                            </Text>
                        </View>

                        <Text style={[styles.modalMessage, { color: theme.muted }]}>
                            {t('settings.confirmDeleteMessage')}
                        </Text>

                        {connections.length > 0 && (
                            <View style={[styles.banksList, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                <Text style={[styles.banksListTitle, { color: theme.text }]}>
                                    {t('settings.connectedBanks')}:
                                </Text>
                                {connections.map((conn) => (
                                    <View key={conn.id} style={styles.bankItem}>
                                        <Ionicons name="business" size={16} color={theme.muted} />
                                        <Text style={[styles.bankName, { color: theme.text }]}>
                                            {conn.connector_name || t('banks.bankFallback')}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.confirmInputContainer}>
                            <Text style={[styles.confirmLabel, { color: theme.text }]}>
                                {t('settings.typeDeleteToConfirm')}
                            </Text>
                            <TextInput
                                style={[styles.confirmInput, {
                                    backgroundColor: theme.background,
                                    borderColor: theme.border,
                                    color: theme.text
                                }]}
                                value={confirmText}
                                onChangeText={setConfirmText}
                                placeholder={currentLanguage === 'pt' ? 'EXCLUIR' : 'DELETE'}
                                placeholderTextColor={theme.muted}
                                autoCapitalize="characters"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.border }]}
                                onPress={() => {
                                    setShowDeleteModal(false);
                                    setConfirmText('');
                                }}
                                disabled={isDeleting}
                            >
                                <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.deleteButton]}
                                onPress={handleDeleteData}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.deleteButtonText}>
                                        {t('settings.confirmDelete')}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </Container>
    );
}

const styles = StyleSheet.create({
    desktopTitle: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
    },
    titleSection: {
        marginTop: 8,
        marginBottom: 28,
    },
    pageSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
        marginTop: 4,
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
    warningText: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 500,
        borderRadius: 24,
        padding: 32,
        gap: 24,
    },
    modalHeader: {
        alignItems: 'center',
        gap: 16,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
    },
    banksList: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        gap: 12,
    },
    banksListTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
    },
    bankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bankName: {
        fontSize: 14,
        fontWeight: '500',
    },
    confirmInputContainer: {
        gap: 8,
    },
    confirmLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    confirmInput: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        fontSize: 16,
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    cancelButton: {
        borderWidth: 1,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#ef4444',
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
