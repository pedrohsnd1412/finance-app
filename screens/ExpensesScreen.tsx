import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Container } from '@/components/Container';
import { Header } from '@/components/Header';

export default function ExpensesScreen() {
    return (
        <Container>
            <Header title="Despesas" />
            <View style={styles.placeholder}>
                <Text style={styles.text}>Lista de despesas e filtros.</Text>
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
