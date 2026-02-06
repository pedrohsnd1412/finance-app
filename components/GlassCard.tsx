import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface GlassCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export function GlassCard({ children, style }: GlassCardProps) {
    return (
        <View style={[styles.card, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 32,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
    },
});
