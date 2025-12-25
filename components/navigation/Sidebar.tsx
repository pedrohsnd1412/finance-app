import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, usePathname } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function Sidebar() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const menuItems = [
        { name: 'Home', icon: 'home' as const, path: '/' },
        { name: 'Despesas', icon: 'money' as const, path: '/expenses' },
        { name: 'Cartões', icon: 'credit-card' as const, path: '/cards' },
        { name: 'Bancos', icon: 'bank' as const, path: '/banks' },
        { name: 'Mais', icon: 'bars' as const, path: '/more' },
    ];

    return (
        <View style={StyleSheet.flatten([
            styles.container,
            {
                backgroundColor: theme.card,
                borderRightColor: theme.border,
                paddingTop: insets.top + 20,
                paddingBottom: insets.bottom + 20,
            }
        ])}>
            <View style={styles.logoContainer}>
                <FontAwesome name="dollar" size={32} color={theme.tint} />
                <Text style={StyleSheet.flatten([styles.logoText, { color: theme.text }])}>Finance<Text style={{ color: theme.tint }}>App</Text></Text>
            </View>

            <ScrollView style={styles.menuContainer}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
                    return (
                        <Link key={item.path} href={item.path} asChild>
                            <Pressable style={StyleSheet.flatten([
                                styles.menuItem,
                                isActive ? { backgroundColor: theme.tint + '15' } : undefined
                            ])}>
                                <FontAwesome
                                    name={item.icon}
                                    size={20}
                                    color={isActive ? theme.tint : theme.tabIconDefault}
                                    style={{ width: 24, textAlign: 'center' }}
                                />
                                <Text style={StyleSheet.flatten([
                                    styles.menuText,
                                    { color: isActive ? theme.tint : theme.text },
                                    isActive ? { fontWeight: '600' } : undefined
                                ])}>
                                    {item.name}
                                </Text>
                            </Pressable>
                        </Link>
                    )
                })}
            </ScrollView>

            <View style={styles.footer}>
                <Text style={StyleSheet.flatten([styles.version, { color: theme.tabIconDefault }])}>v1.0.0</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 250,
        height: '100%',
        borderRightWidth: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 40,
        gap: 12,
    },
    logoText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    menuContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 4,
        gap: 12,
    },
    menuText: {
        fontSize: 16,
    },
    footer: {
        padding: 24,
    },
    version: {
        fontSize: 12,
    }
});
