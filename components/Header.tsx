import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
        height: 72,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 0,
        marginBottom: 8,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -10,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -1,
    },
    right: {
        justifyContent: 'center',
    },
});
