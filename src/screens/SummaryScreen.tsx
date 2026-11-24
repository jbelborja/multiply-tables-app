import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';
import { theme } from '../styles/theme';
import tw from 'twrnc';

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

const styles = {
    container: tw`flex-1 bg-[#f9fafb] p-8`,
    content: tw`flex-1 items-center justify-center`,
    iconCircle: tw`mb-6 h-[100px] w-[100px] items-center justify-center rounded-full bg-white shadow-md`,
    iconEmoji: tw`text-[50px]`,
    title: tw`mb-8 text-center text-[32px] font-extrabold text-[#111827]`,
    scoreCard: tw`mb-8 w-full items-center rounded-2xl bg-white p-8 shadow-md`,
    scoreLabel: tw`mb-2 text-base text-[#4b5563]`,
    scoreValue: tw`mb-1 text-[64px] font-black`,
    percentageText: tw`text-lg font-semibold text-[#9ca3af]`,
    message: tw`px-5 text-center text-base italic text-[#4b5563]`,
    button: tw`items-center rounded-xl bg-[#4f46e5] py-4 shadow-sm`,
    buttonText: tw`text-lg font-bold text-white`,
};
