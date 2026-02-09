import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';

interface ContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
    useSafeArea?: boolean;
    maxWidth?: number;
    scrollEnabled?: boolean;
}

export function Container({ children, style, useSafeArea = true, maxWidth = 1400, scrollEnabled = true }: ContainerProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const { isDesktop } = useResponsive();
    const backgroundColor = '#0d0d12'; // Force dark background across all platforms for consistent branding

    const Wrapper = useSafeArea ? SafeAreaView : View;

    if (isDesktop) {
        return (
            <View style={[styles.desktopMain, { backgroundColor }]}>
                {scrollEnabled ? (
                    <ScrollView
                        style={styles.desktopScroll}
                        contentContainerStyle={[styles.desktopContent, { maxWidth }, style]}
                        showsVerticalScrollIndicator={false}
                    >
                        {children}
                    </ScrollView>
                ) : (
                    <View style={[styles.desktopContent, { maxWidth }, style]}>
                        {children}
                    </View>
                )}
            </View>
        );
    }

    return (
        <Wrapper style={[{ flex: 1, backgroundColor }, styles.wrapper]}>
            {scrollEnabled ? (
                <ScrollView
                    style={styles.wrapper}
                    contentContainerStyle={[styles.container, style]}
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </ScrollView>
            ) : (
                <View style={[styles.container, style]}>
                    {children}
                </View>
            )}
        </Wrapper>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    container: {
        flexGrow: 1,
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    desktopMain: {
        flex: 1,
        height: '100%',
    },
    desktopScroll: {
        flex: 1,
    },
    desktopContent: {
        flexGrow: 1,
        width: '100%',
        maxHeight: '100%',
        alignSelf: 'center',
        paddingHorizontal: 40,
        paddingBottom: 40,
        paddingTop: 20,
    },
});
