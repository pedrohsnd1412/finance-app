import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const GOALS = [
    { id: '1', title: 'Reserve', amount: '$7,000', target: '$10,000', color: '#84CC16', icon: 'wallet-outline' },
    { id: '2', title: 'Travel', amount: '$2,500', target: '$4,000', color: '#F59E0B', icon: 'airplane-outline' },
    { id: '3', title: 'Car', amount: '$1,600', target: '$20,000', color: '#3B82F6', icon: 'car-outline' },
    { id: '4', title: 'Real estate', amount: '$5,300', target: '$70,000', color: '#10B981', icon: 'home-outline' },
];

export function GoalTracker() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Goal tracker</Text>
                <View style={styles.addButton}>
                    <Ionicons name="add" size={16} color={theme.muted} />
                    <Text style={[styles.addText, { color: theme.muted }]}>Add goals</Text>
                </View>
            </View>

            <View style={styles.list}>
                {GOALS.map((goal) => {
                    const progress = (parseFloat(goal.amount.replace('$', '').replace(',', '')) /
                        parseFloat(goal.target.replace('$', '').replace(',', ''))) * 100;
                    return (
                        <View key={goal.id} style={styles.goalItem}>
                            <View style={[styles.iconBox, { backgroundColor: theme.background }]}>
                                <Ionicons name={goal.icon as any} size={20} color={theme.text} />
                            </View>
                            <View style={styles.goalInfo}>
                                <View style={styles.goalHeader}>
                                    <Text style={[styles.goalTitle, { color: theme.text }]}>{goal.title}</Text>
                                    <View style={styles.goalValues}>
                                        <Text style={[styles.goalAmount, { color: theme.text }]}>{goal.amount}</Text>
                                        <Text style={[styles.goalTarget, { color: theme.muted }]}>/{goal.target}</Text>
                                    </View>
                                </View>
                                <View style={styles.progressContainer}>
                                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                                        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: goal.color }]} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 24,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    addText: {
        fontSize: 13,
        fontWeight: '600',
    },
    list: {
        gap: 20,
    },
    goalItem: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goalInfo: {
        flex: 1,
        gap: 8,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    goalTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    goalValues: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    goalAmount: {
        fontSize: 13,
        fontWeight: '700',
    },
    goalTarget: {
        fontSize: 12,
        fontWeight: '500',
    },
    progressContainer: {
        height: 6,
        width: '100%',
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
});
