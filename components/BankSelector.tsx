import { getBankLogo } from '@/constants/Banks';
import { useConnections } from '@/hooks/useConnections';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BankSelectorProps {
    selectedId: string | null;
    onSelect: (id: string | null) => void;
}


export function BankSelector({ selectedId, onSelect }: BankSelectorProps) {
    const { connections } = useConnections();
    const router = useRouter();

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            <TouchableOpacity
                style={[styles.item, selectedId === null && styles.selectedItem]}
                onPress={() => onSelect(null)}
            >
                <View style={[styles.iconContainer, selectedId === null && styles.selectedIcon]}>
                    <Text style={styles.allText}>Todos</Text>
                </View>
                <Text style={styles.label}>Todos</Text>
            </TouchableOpacity>

            {connections.map((conn) => {
                const logoUrl = getBankLogo(conn.connector_name);

                return (
                    <TouchableOpacity
                        key={conn.id}
                        style={[styles.item, selectedId === conn.id && styles.selectedItem]}
                        onPress={() => onSelect(conn.id)}
                    >
                        <View style={[styles.iconContainer, selectedId === conn.id && styles.selectedIcon]}>
                            <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="contain" />
                        </View>
                        <Text style={styles.label} numberOfLines={1}>{conn.connector_name}</Text>
                    </TouchableOpacity>
                );
            })}

            <TouchableOpacity
                style={styles.item}
                onPress={() => router.push('/banks')}
            >
                <View style={[styles.iconContainer, { backgroundColor: '#eee' }]}>
                    <Ionicons name="settings-outline" size={24} color="#666" />
                </View>
                <Text style={styles.label}>Gerenciar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        gap: 12,
        paddingBottom: 8,
    },
    item: {
        alignItems: 'center',
        opacity: 0.6,
        maxWidth: 70,
    },
    selectedItem: {
        opacity: 1,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
    },
    selectedIcon: {
        borderColor: '#000', // Primary color
        borderWidth: 2,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    allText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    label: {
        fontSize: 11,
        textAlign: 'center',
    },
});
