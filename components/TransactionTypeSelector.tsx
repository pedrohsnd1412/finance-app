import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { TransactionTypeFilter, TYPE_FILTER_OPTIONS } from '@/types/home.types';
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface TransactionTypeFilterProps {
    selected: TransactionTypeFilter;
    onChange: (type: TransactionTypeFilter) => void;
    style?: ViewStyle;
}

export function TransactionTypeSelector({ selected, onChange, style }: TransactionTypeFilterProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.container, style]}>
            {TYPE_FILTER_OPTIONS.map((option) => {
                const isSelected = option.key === selected;
                return (
                    <Pressable
                        key={option.key}
                        onPress={() => onChange(option.key)}
                        style={[
                            styles.option,
                            isSelected && styles.optionSelected,
                            isSelected && { backgroundColor: theme.card }
                        ]}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                { color: isSelected ? theme.tint : theme.muted }
                            ]}
                        >
                            {option.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 5,
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    option: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    optionSelected: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    optionText: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});
