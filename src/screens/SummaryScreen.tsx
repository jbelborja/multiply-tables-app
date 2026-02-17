import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Summary'>;

export default function SummaryScreen({ route, navigation }: Props) {
    const { score, total, mode, tables } = route.params;
    const { addResult } = useSession();

    useEffect(() => {
        addResult({
            score,
            total,
            mode,
            tables
        });
    }, []);

    const percentage = Math.round((score / total) * 100);

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>{percentage >= 80 ? '🎉' : percentage >= 50 ? '👏' : '✍️'}</Text>
                </View>

                <Text style={styles.title}>¡Práctica Completada!</Text>

                <View style={styles.scoreCard}>
                    <Text style={styles.scoreLabel}>Tu Puntuación</Text>
                    <Text style={[styles.scoreValue, { color: percentage >= 50 ? theme.colors.success : theme.colors.error }]}>
                        {Number.isInteger(score) ? score : score.toFixed(1)} / {total}
                    </Text>
                    <Text style={styles.percentageText}>{percentage}% Correcto</Text>
                </View>

                <Text style={styles.message}>
                    {score === total ? '¡Increíble! Dominas estas tablas.' :
                        score > total / 2 ? '¡Buen trabajo! Sigue así.' : '¡Sigue practicando para mejorar!'}
                </Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Main')}
            >
                <Text style={styles.buttonText}>Volver al Inicio</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.xl,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.md,
        marginBottom: theme.spacing.lg,
    },
    iconEmoji: {
        fontSize: 50,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    scoreCard: {
        backgroundColor: theme.colors.white,
        padding: theme.spacing.xl,
        borderRadius: theme.roundness.xl,
        alignItems: 'center',
        width: '100%',
        ...theme.shadows.md,
        marginBottom: theme.spacing.xl,
    },
    scoreLabel: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
    },
    scoreValue: {
        fontSize: 64,
        fontWeight: '900',
        marginBottom: theme.spacing.xs,
    },
    percentageText: {
        ...theme.typography.h3,
        color: theme.colors.textLight,
    },
    message: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
        paddingHorizontal: 20,
    },
    button: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        borderRadius: theme.roundness.lg,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    buttonText: {
        color: theme.colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
