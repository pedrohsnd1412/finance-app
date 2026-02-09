import { Sidebar } from '@/components/desktop/Sidebar';
import { TopHeader } from '@/components/desktop/TopHeader';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
// @ts-ignore - unstable-native-tabs might not have types in all versions or is missing in local defs
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={24} style={{ marginBottom: 0 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isDesktop } = useResponsive();
  const theme = Colors[colorScheme ?? 'light'];

  // WEB & DESKTOP: Use standard Tabs (Sidebar on Desktop)
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {isDesktop && <Sidebar />}
        <View style={styles.content}>
          {isDesktop && <TopHeader />}
          <Tabs
            tabBar={() => null}
            screenOptions={{
              tabBarActiveTintColor: theme.tint,
              headerShown: false,
              tabBarStyle: {
                display: 'none',
                height: 0,
                borderTopWidth: 0,
              },
            }}>
            <Tabs.Screen
              name="index"
              options={{
                title: 'Visão Geral',
                tabBarIcon: ({ color }) => <TabBarIcon name="home-outline" color={color} />,
              }}
            />
            <Tabs.Screen
              name="incomes"
              options={{
                title: 'Receitas',
                tabBarIcon: ({ color }) => <TabBarIcon name="arrow-down-circle-outline" color={color} />,
              }}
            />
            <Tabs.Screen
              name="expenses"
              options={{
                title: 'Despesas',
                tabBarIcon: ({ color }) => <TabBarIcon name="arrow-up-circle-outline" color={color} />,
              }}
            />
            <Tabs.Screen
              name="cashflow"
              options={{
                title: 'Fluxo',
                tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart-outline" color={color} />,
                href: isDesktop ? undefined : null,
              }}
            />
            <Tabs.Screen
              name="banks"
              options={{
                title: 'Bancos',
                tabBarIcon: ({ color }) => <TabBarIcon name="business-outline" color={color} />,
                href: isDesktop ? undefined : null,
              }}
            />
            <Tabs.Screen
              name="budget"
              options={{
                title: 'Metas',
                tabBarIcon: ({ color }) => <TabBarIcon name="pie-chart-outline" color={color} />,
                href: isDesktop ? undefined : null,
              }}
            />
            <Tabs.Screen
              name="cards"
              options={{
                title: 'Cartões',
                tabBarIcon: ({ color }) => <TabBarIcon name="card-outline" color={color} />,
              }}
            />
            <Tabs.Screen
              name="settings"
              options={{
                title: 'Ajustes',
                tabBarIcon: ({ color }) => <TabBarIcon name="settings-outline" color={color} />,
                href: isDesktop ? undefined : null,
              }}
            />
            <Tabs.Screen
              name="more"
              options={{
                title: 'Mais',
                tabBarIcon: ({ color }) => <TabBarIcon name="menu-outline" color={color} />,
              }}
            />
          </Tabs>
        </View>
      </View>
    );
  }

  /* 
   * REVERTED TO STANDARD TABS AS PER REQUEST 
   * "no mobile a gente vai deixar de utilizar o pacote de nova tab bar do iOS... a gente vai usar a tab bar fixa"
   */
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarStyle: {
          backgroundColor: '#0d0d12',
          borderTopColor: 'rgba(255,255,255,0.1)',
          height: 90,
          paddingTop: 12,
          paddingBottom: 32,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="incomes"
        options={{
          title: 'Receitas',
          tabBarIcon: ({ color }) => <TabBarIcon name="arrow-down-circle-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Despesas',
          tabBarIcon: ({ color }) => <TabBarIcon name="arrow-up-circle-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cashflow"
        options={{
          title: 'Fluxo',
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          href: null,
          title: 'Cartões',
          tabBarIcon: ({ color }) => <TabBarIcon name="card-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="banks"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Mais',
          tabBarIcon: ({ color }) => <TabBarIcon name="menu-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    backgroundColor: '#0d0d12',
  },
});
