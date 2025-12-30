import { Sidebar } from '@/components/navigation/Sidebar';
import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Icon, Label, NativeTabs, VectorIcon } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isDesktop } = useResponsive();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      {isDesktop && <Sidebar />}
      <View style={styles.content}>
        <NativeTabs>
          <NativeTabs.Trigger name="index">
            <Label>Home</Label>
            {Platform.select({
              ios: <Icon sf="house.fill" />,
              android: <Icon src={<VectorIcon family={FontAwesome} name="home" />} />,
              default: <Icon src={<VectorIcon family={FontAwesome} name="home" />} />,
            })}
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="expenses">
            <Label>Despesas</Label>
            {Platform.select({
              ios: <Icon sf="chart.pie.fill" />,
              android: <Icon src={<VectorIcon family={FontAwesome} name="money" />} />,
              default: <Icon src={<VectorIcon family={FontAwesome} name="money" />} />,
            })}
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="cards">
            <Label>Cartões</Label>
            {Platform.select({
              ios: <Icon sf="creditcard.fill" />,
              android: <Icon src={<VectorIcon family={FontAwesome} name="credit-card" />} />,
              default: <Icon src={<VectorIcon family={FontAwesome} name="credit-card" />} />,
            })}
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="banks">
            <Label>Bancos</Label>
            {Platform.select({
              ios: <Icon sf="building.columns.fill" />,
              android: <Icon src={<VectorIcon family={FontAwesome} name="bank" />} />,
              default: <Icon src={<VectorIcon family={FontAwesome} name="bank" />} />,
            })}
          </NativeTabs.Trigger>

          <NativeTabs.Trigger name="more">
            <Label>Mais</Label>
            {Platform.select({
              ios: <Icon sf="ellipsis" />,
              android: <Icon src={<VectorIcon family={FontAwesome} name="bars" />} />,
              default: <Icon src={<VectorIcon family={FontAwesome} name="bars" />} />,
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
