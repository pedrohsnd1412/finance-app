import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Container } from '@/components/Container';
import { Header } from '@/components/Header';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function HomeScreen() {
    return (
        <Container>
            <Header title="Resumo" />
            <View style={styles.placeholder}>
                <Text style={styles.text}>Saldo atual e movimentações recentes aparecerão aqui.</Text>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        opacity: 0.6,
    },
    text: {
        textAlign: 'center',
        fontSize: 16,
    },
});
