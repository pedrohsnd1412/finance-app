import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useColorScheme } from '../useColorScheme';
import { useResponsive } from '../useResponsive';

interface PageContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
    maxWidth?: number;
}

export function PageContainer({ children, style, maxWidth = 1200 }: PageContainerProps) {
    const { isDesktop } = useResponsive();
    const colorScheme = useColorScheme();

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: Colors[colorScheme ?? 'light'].background },
                isDesktop && styles.desktopContainer,
                style,
            ]}
        >
            <View style={[styles.content, isDesktop && { maxWidth, alignSelf: 'center', width: '100%' }]}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    desktopContainer: {
        // Optional: Add specific desktop padding or background adjustments here
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    content: {
        flex: 1,
    },
});
