import { useColorScheme } from '@/components/useColorScheme';
import { useResponsive } from '@/components/useResponsive';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { SafeAreaView, StyleSheet, View, ViewStyle } from 'react-native';

interface ContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
    useSafeArea?: boolean;
    maxWidth?: number;
}

export function Container({ children, style, useSafeArea = true, maxWidth = 1200 }: ContainerProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const backgroundColor = Colors[theme].background;
    const { isDesktop } = useResponsive();

    const Wrapper = useSafeArea ? SafeAreaView : View;

    return (
        <Wrapper style={[{ flex: 1, backgroundColor }, styles.wrapper]}>
            <View
                style={StyleSheet.flatten([
                    styles.container,
                    {
                        maxWidth: isDesktop ? maxWidth : undefined,
                        paddingHorizontal: isDesktop ? 32 : 16,
                        paddingVertical: isDesktop ? 32 : 16,
                    },
                    style
                ])}
            >
                {children}
            </View>
        </Wrapper>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
    container: {
        flex: 1,
        width: '100%',
        alignSelf: 'center',
    },
});
