import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';

function TabBarIcon(props: {
    name: React.ComponentProps<typeof FontAwesome>['name'];
    color: string;
}) {
    return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export function MobileLayout() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.tint,
                headerShown: false,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="expenses"
                options={{
                    title: 'Despesas',
                    tabBarIcon: ({ color }) => <TabBarIcon name="money" color={color} />,
                }}
            />
            <Tabs.Screen
                name="cards"
                options={{
                    title: 'Cartões',
                    tabBarIcon: ({ color }) => <TabBarIcon name="credit-card" color={color} />,
                }}
            />
            <Tabs.Screen
                name="banks"
                options={{
                    title: 'Bancos',
                    tabBarIcon: ({ color }) => <TabBarIcon name="bank" color={color} />,
                }}
            />
            <Tabs.Screen
                name="more"
                options={{
                    title: 'Mais',
                    tabBarIcon: ({ color }) => <TabBarIcon name="bars" color={color} />,
                }}
            />
        </Tabs>
    );
}
