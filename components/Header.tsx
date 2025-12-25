import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface HeaderProps {
    title: string;
    rightElement?: React.ReactNode;
}

export function Header({ title, rightElement }: HeaderProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';

    return (
        <View style={[styles.container, { borderBottomColor: Colors[theme].border }]}>
            <Text style={[styles.title, { color: Colors[theme].text }]}>{title}</Text>
            {rightElement && <View style={styles.right}>{rightElement}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 0, // Container handles padding
        marginBottom: 16,
        borderBottomWidth: Platform.select({ web: 1, default: 0 }),
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    right: {
        justifyContent: 'center',
    },
});
