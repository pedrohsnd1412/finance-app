import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RECIPIENTS = [
    { id: '1', name: 'Davis', avatar: 'https://i.pravatar.cc/150?u=davis' },
    { id: '2', name: 'Eli', avatar: 'https://i.pravatar.cc/150?u=eli' },
    { id: '3', name: 'Leo', avatar: 'https://i.pravatar.cc/150?u=leo' },
    { id: '4', name: 'Amanda', avatar: 'https://i.pravatar.cc/150?u=amanda' },
    { id: '5', name: 'Ann', avatar: 'https://i.pravatar.cc/150?u=ann' },
    { id: '6', name: 'Sin', avatar: 'https://i.pravatar.cc/150?u=sin' },
];

export function QuickPaymentList() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Quick payment</Text>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={20} color={theme.muted} />
                </TouchableOpacity>
            </View>

            <View style={styles.list}>
                {RECIPIENTS.map((person) => (
                    <View key={person.id} style={styles.person}>
                        <Image source={{ uri: person.avatar }} style={styles.avatar} />
                        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{person.name}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
    },
    list: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    person: {
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E2E8F0',
    },
    name: {
        fontSize: 12,
        fontWeight: '600',
    },
});
