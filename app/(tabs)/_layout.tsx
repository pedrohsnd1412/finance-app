import { Sidebar } from '@/components/desktop/Sidebar';
import { TopHeader } from '@/components/desktop/TopHeader';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
// @ts-ignore - unstable-native-tabs might not have types in all versions or is missing in local defs
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
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
                tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
              }}
            />
            <Tabs.Screen
              name="incomes"
              options={{
                title: 'Receitas',
                tabBarIcon: ({ color }) => <TabBarIcon name="arrow-circle-down" color={color} />,
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
              name="cashflow"
              options={{
                title: 'Fluxo',
                tabBarIcon: ({ color }) => <TabBarIcon name="line-chart" color={color} />,
                href: isDesktop ? undefined : null,
              }}
            />
            <Tabs.Screen
              name="banks"
              options={{
                title: 'Bancos',
                tabBarIcon: ({ color }) => <TabBarIcon name="bank" color={color} />,
                href: isDesktop ? undefined : null,
              }}
            />
            <Tabs.Screen
              name="budget"
              options={{
                title: 'Metas',
                tabBarIcon: ({ color }) => <TabBarIcon name="pie-chart" color={color} />,
                href: isDesktop ? undefined : null,
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
              name="settings"
              options={{
                title: 'Ajustes',
                tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
                href: isDesktop ? undefined : null,
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
        </View>
      </View>
    );
  }

  // NATIVE MOBILE (iOS/Android): Use NativeTabs
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        {Platform.select({
          ios: <Icon sf="house.fill" />,
          android: <Icon src={<VectorIcon family={FontAwesome} name="home" />} />,
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="incomes">
        <Label>Receitas</Label>
        {Platform.select({
          ios: <Icon sf="arrow.down.circle.fill" />,
          android: <Icon src={<VectorIcon family={FontAwesome} name="arrow-circle-down" />} />,
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="expenses">
        <Label>Despesas</Label>
        {Platform.select({
          ios: <Icon sf="banknote.fill" />,
          android: <Icon src={<VectorIcon family={FontAwesome} name="money" />} />,
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cards">
        <Label>Cartões</Label>
        {Platform.select({
          ios: <Icon sf="creditcard.fill" />,
          android: <Icon src={<VectorIcon family={FontAwesome} name="credit-card" />} />,
        })}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="more">
        <Label>Mais</Label>
        {Platform.select({
          ios: <Icon sf="line.3.horizontal" />,
          android: <Icon src={<VectorIcon family={FontAwesome} name="bars" />} />,
        })}
      </NativeTabs.Trigger>
    </NativeTabs>
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
