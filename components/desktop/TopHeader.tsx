import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function TopHeader() {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { summary } = useFinanceData('month');

    return (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={[styles.searchContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Ionicons name="search-outline" size={20} color={theme.muted} />
                <TextInput
                    placeholder={t('header.searchPlaceholder')}
                    placeholderTextColor={theme.muted}
                    style={[styles.searchInput, { color: theme.text }]}
                />
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="notifications-outline" size={22} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="settings-outline" size={22} color={theme.text} />
                </TouchableOpacity>

                <View style={styles.divider} />

                <View style={styles.userProfile}>
                    <View style={[styles.avatar, { backgroundColor: theme.tint + '20' }]}>
                        <Text style={[styles.avatarText, { color: theme.tint }]}>
                            {(summary.userName || 'U')[0].toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text style={[styles.userName, { color: theme.text }]}>
                            {summary.userName || 'User'}
                        </Text>
                        <Text style={[styles.userEmail, { color: theme.muted }]}>
                            {summary.userName ? `${summary.userName.toLowerCase()}@acru.com` : 'user@acru.com'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={[styles.addButton, { borderColor: theme.border }]}>
                    <Ionicons name="add" size={20} color={theme.text} />
                    <Text style={[styles.addButtonText, { color: theme.text }]}>{t('header.addWidget')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        backgroundColor: 'transparent',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 400,
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        paddingHorizontal: 16,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginHorizontal: 16,
    },
    userProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginRight: 24,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
    },
    userName: {
        fontSize: 15,
        fontWeight: '700',
    },
    userEmail: {
        fontSize: 13,
        fontWeight: '500',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
