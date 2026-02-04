import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const NAV_ITEMS = [
    { id: 'dashboard', icon: 'grid-outline', labelKey: 'tabs.home', route: '/' },
    { id: 'accounts', icon: 'wallet-outline', labelKey: 'tabs.banks', route: '/banks' },
    { id: 'transactions', icon: 'swap-horizontal-outline', labelKey: 'home.transactions', route: '/expenses' },
    { id: 'cashflow', icon: 'trending-up-outline', labelKey: 'home.stats.income', route: '/cashflow' },
    { id: 'budget', icon: 'pie-chart-outline', labelKey: 'tabs.expenses', route: '/budget' },
    { id: 'settings', icon: 'settings-outline', labelKey: 'more.preferences', route: '/settings' },
];

export function Sidebar() {
    const { t } = useTranslation();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const pathname = usePathname();
    const [isHovered, setIsHovered] = React.useState(false);

    const sidebarWidth = isHovered ? 260 : 80;

    return (
        <View
            style={[
                styles.sidebar,
                {
                    backgroundColor: theme.card,
                    borderRightColor: theme.border,
                    width: sidebarWidth,
                }
            ]}
            // @ts-ignore - Web only events
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <View style={styles.logoContainer}>
                <Text style={[styles.logoText, { color: theme.text }]}>
                    {isHovered ? 'ACRU' : 'A'}
                </Text>
            </View>

            <View style={styles.navContainer}>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.route;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.navItem,
                                isActive && { backgroundColor: theme.tint + '10' },
                                !isHovered && { justifyContent: 'center', paddingHorizontal: 0 }
                            ]}
                            onPress={() => item.route !== '#' && router.push(item.route as any)}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={22}
                                color={isActive ? theme.tint : theme.muted}
                            />
                            {isHovered && (
                                <Text
                                    style={[
                                        styles.navLabel,
                                        { color: isActive ? theme.text : theme.muted },
                                        isActive && { fontWeight: '700' }
                                    ]}
                                    numberOfLines={1}
                                >
                                    {t(item.labelKey)}
                                </Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.collapseButton, !isHovered && { justifyContent: 'center', paddingHorizontal: 0 }]}>
                    <Ionicons name={isHovered ? "chevron-back" : "chevron-forward"} size={20} color={theme.muted} />
                    {isHovered && (
                        <Text style={[styles.collapseText, { color: theme.muted }]}>{t('sidebar.collapse')}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sidebar: {
        height: '100%',
        borderRightWidth: 1,
        paddingVertical: 32,
        // Remove paddingHorizontal and handle it in items
        transitionProperty: 'width', // Works on web
        transitionDuration: '0.3s',
    },
    logoContainer: {
        marginBottom: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: -1,
    },
    navContainer: {
        flex: 1,
        gap: 8,
        paddingHorizontal: 12,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        gap: 12,
        height: 50,
    },
    navLabel: {
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
    },
    footer: {
        paddingHorizontal: 12,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    collapseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        height: 50,
        paddingHorizontal: 16,
    },
    collapseText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
