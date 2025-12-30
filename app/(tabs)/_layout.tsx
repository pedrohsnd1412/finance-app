import { Sidebar } from '@/components/navigation/Sidebar';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
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

  // WEB IMPLEMENTATION (Standard JS Tabs)
  // NativeTabs is not fully supported on web and causes renderToImageAsync errors with VectorIcons
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {isDesktop && <Sidebar />}
        <View style={styles.content}>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: theme.tint,
              headerShown: false,
              // On Desktop/Large screens, hide the mobile bottom tab bar
              tabBarStyle: isDesktop ? { display: 'none' } : undefined,
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
        </View>
      </View>
    );
  }

  // NATIVE IMPLEMENTATION (iOS/Android NativeTabs)
  return (
    <View style={styles.container}>
      {/* Sidebar usually not needed on mobile native apps, but keeping logic consistent just in case */}
      {isDesktop && <Sidebar />}
      <View style={styles.content}>
        <NativeTabs>
          <NativeTabs.Trigger name="index">
            <Label>Home</Label>
            {Platform.select({
              ios: <Icon sf="house.fill" />,
              android: <Icon src={<VectorIcon family={FontAwesome} name="home" />} />,
              default: <Icon sf="house.fill" />,
            })}
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="expenses">
            <Label>Despesas</Label>
            {Platform.select({
              ios: <Icon sf="chart.pie.fill" />,
              android: <Icon src={<VectorIcon family={FontAwesome} name="money" />} />,
              default: <Icon sf="chart.pie.fill" />,
            })}
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="cards">
            <Label>Cartões</Label>
            {Platform.select({
              ios: <Icon sf="creditcard.fill" />,
              android: <Icon src={<VectorIcon family={FontAwesome} name="credit-card" />} />,
              default: <Icon sf="creditcard.fill" />,
            })}
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="banks">
            <Label>Bancos</Label>
            {Platform.select({
              ios: <Icon sf="building.columns.fill" />,
              android: <Icon src={<VectorIcon family={FontAwesome} name="bank" />} />,
              default: <Icon sf="building.columns.fill" />,
            })}
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="more">
            <Label>Mais</Label>
            {Platform.select({
              ios: <Icon sf="ellipsis" />,
              android: <Icon src={<VectorIcon family={FontAwesome} name="bars" />} />,
              default: <Icon sf="ellipsis" />,
            })}
          </NativeTabs.Trigger>
        </NativeTabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
});
