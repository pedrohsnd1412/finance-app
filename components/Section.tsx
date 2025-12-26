import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface SectionProps {
    title: string;
    children: React.ReactNode;
    style?: ViewStyle;
    action?: React.ReactNode;
}

export function Section({ title, children, style, action }: SectionProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={StyleSheet.flatten([styles.container, style])}>
            <View style={styles.header}>
                <Text style={StyleSheet.flatten([styles.title, { color: theme.text }])}>
                    {title}
                </Text>
                {action}
            </View>
            <View style={StyleSheet.flatten([styles.content, { backgroundColor: theme.card }])}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    content: {
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
});
