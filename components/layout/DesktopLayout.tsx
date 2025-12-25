import { Sidebar } from '@/components/navigation/Sidebar';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export function DesktopLayout() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={styles.container}>
            <Sidebar />
            <View style={styles.content}>
                <Tabs
                    screenOptions={{
                        headerShown: false,
                        // Completely remove the tab bar from the DOM on desktop
                        tabBar: () => null,
                        // Ensure content doesn't get messed up by safe areas meant for mobile
                        tabBarHideOnKeyboard: true,
                    }}>
                    <Tabs.Screen name="index" options={{ title: 'Home' }} />
                    <Tabs.Screen name="expenses" options={{ title: 'Despesas' }} />
                    <Tabs.Screen name="cards" options={{ title: 'Cartões' }} />
                    <Tabs.Screen name="banks" options={{ title: 'Bancos' }} />
                    <Tabs.Screen name="more" options={{ title: 'Mais' }} />
                </Tabs>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        height: '100%',
        width: '100%',
    },
    content: {
        flex: 1,
        height: '100%',
        backgroundColor: 'transparent',
    },
});
