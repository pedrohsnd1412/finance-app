import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Period, PERIOD_OPTIONS } from '@/types/home.types';
import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface PeriodFilterProps {
    selected: Period;
    onChange: (period: Period) => void;
    style?: ViewStyle;
}

export function PeriodFilter({ selected, onChange, style }: PeriodFilterProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={StyleSheet.flatten([styles.container, { backgroundColor: theme.card }, style])}>
            {PERIOD_OPTIONS.map((option) => {
                const isSelected = option.key === selected;
                return (
                    <Pressable
                        key={option.key}
                        onPress={() => onChange(option.key)}
                        style={StyleSheet.flatten([
                            styles.option,
                            isSelected && { backgroundColor: theme.tint }
                        ])}
                    >
                        <Text
                            style={StyleSheet.flatten([
                                styles.optionText,
                                { color: isSelected ? '#FFFFFF' : theme.text }
                            ])}
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
        borderRadius: 12,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    option: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
