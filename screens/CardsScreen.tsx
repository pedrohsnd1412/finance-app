import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Container } from '@/components/Container';
import { Header } from '@/components/Header';

export default function CardsScreen() {
    return (
        <Container>
            <Header title="Meus Cartões" />
            <View style={styles.placeholder}>
                <Text style={styles.text}>Gerenciamento de cartões de crédito e débito.</Text>
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
