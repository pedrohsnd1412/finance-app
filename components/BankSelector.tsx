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
        <View style={styles.outerContainer}>
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
                    <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }]}>
                        <Ionicons name="add" size={24} color="#FFFFFF" />
                    </View>
                    <Text style={styles.label}>Novo</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        marginBottom: 32,
    },
    container: {
        paddingHorizontal: 0,
        gap: 20,
        paddingBottom: 8,
    },
    item: {
        alignItems: 'center',
        opacity: 0.5,
        width: 72,
    },
    selectedItem: {
        opacity: 1,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
    },
    selectedIcon: {
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
    },
    logo: {
        width: 32,
        height: 32,
    },
    allText: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#FFFFFF',
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        color: '#94A3B8',
    },
});
