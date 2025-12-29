import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

interface HeaderProps {
    title: string;
    rightElement?: React.ReactNode;
    showBack?: boolean;
    onBack?: () => void;
}

export function Header({ title, rightElement, showBack, onBack }: HeaderProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';

    return (
        <View style={[styles.container, { borderBottomColor: Colors[theme].border }]}>
            <View style={styles.leftSection}>
                {showBack && (
                    <Pressable onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={Colors[theme].text} />
                    </Pressable>
                )}
                <Text style={[styles.title, { color: Colors[theme].text }]}>{title}</Text>
            </View>
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
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
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
