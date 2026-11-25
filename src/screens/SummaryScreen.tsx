import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';
import { theme } from '../styles/theme';
import tw from 'twrnc';

type Props = NativeStackScreenProps<RootStackParamList, 'Summary'>;

export default function SummaryScreen({ route, navigation }: Props) {
    const { score, total, mode, tables } = route.params;
    const { addResult, saveError } = useSession();

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
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.page}>
                <View style={styles.content}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.iconEmoji}>{percentage >= 80 ? '🎉' : percentage >= 50 ? '👏' : '✍️'}</Text>
                    </View>

                    <Text style={styles.eyebrow}>MISIÓN COMPLETADA</Text>
                    <Text style={styles.title}>{score === total ? '¡Eres increíble!' : '¡Buen trabajo, héroe!'}</Text>
                    <Text style={styles.message}>
                        {score === total ? '¡Increíble! Dominas estas tablas.' :
                            score > total / 2 ? '¡Vas genial! Cada reto te hace más fuerte.' : '¡Sigue practicando! Aprender lleva su tiempo y tú puedes.'}
                    </Text>

                    <View style={styles.scoreCard}>
                        <Text style={styles.scoreLabel}>Tu puntuación</Text>
                        <Text style={[styles.scoreValue, { color: percentage >= 50 ? theme.colors.success : theme.colors.error }]}>
                            {Number.isInteger(score) ? score : score.toFixed(1)}<Text style={styles.scoreTotal}> / {total}</Text>
                        </Text>
                        <View style={styles.resultTrack}>
                            <View style={[styles.resultFill, { width: `${percentage}%` }]} />
                        </View>
                        <Text style={styles.percentageText}>{percentage}% de respuestas correctas</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.detailCard}>
                            <Text style={styles.detailEmoji}>📚</Text>
                            <Text style={styles.detailLabel}>Tablas</Text>
                            <Text style={styles.detailValue}>{tables.join(', ')}</Text>
                        </View>
                        <View style={styles.detailCard}>
                            <Text style={styles.detailEmoji}>{mode === 'typed' ? '✍️' : '🎯'}</Text>
                            <Text style={styles.detailLabel}>Tu modo</Text>
                            <Text style={styles.detailValue}>{mode === 'typed' ? 'Escribir' : 'Elegir'}</Text>
                        </View>
                    </View>
                    {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Main')}
                    activeOpacity={0.82}
                >
                    <Text style={styles.buttonText}>¡Otra misión!</Text>
                    <Text style={styles.buttonArrow}>→</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = {
    container: tw`flex-1 bg-[#f5f8ff]`,
    scrollContent: tw`min-h-full justify-center px-4 py-8`,
    page: [tw`w-full self-center`, { maxWidth: 620 }],
    content: tw`items-center`,
    iconCircle: tw`mb-4 h-[92px] w-[92px] items-center justify-center rounded-full bg-[#fff1c2]`,
    iconEmoji: tw`text-[50px]`,
    eyebrow: tw`mb-2 text-xs font-black tracking-widest text-[#7046d8]`,
    title: tw`mb-2 text-center text-[30px] font-black text-[#172554]`,
    scoreCard: tw`mb-4 mt-6 w-full items-center rounded-3xl border border-[#e7ecf6] bg-white p-6 shadow-sm`,
    scoreLabel: tw`mb-1 text-base font-bold text-[#73809a]`,
    scoreValue: tw`text-[58px] font-black`,
    scoreTotal: tw`text-[32px] font-bold text-[#a2acc0]`,
    resultTrack: tw`mt-2 h-3 w-full overflow-hidden rounded-full bg-[#e8edf5]`,
    resultFill: tw`h-full rounded-full bg-[#39b98b]`,
    percentageText: tw`mt-3 text-sm font-bold text-[#52658c]`,
    message: tw`max-w-[460px] px-4 text-center text-base leading-6 text-[#52617f]`,
    detailRow: tw`mb-3 w-full flex-row gap-3`,
    detailCard: tw`flex-1 items-center rounded-2xl border border-[#e7ecf6] bg-white p-4`,
    detailEmoji: tw`mb-1 text-2xl`,
    detailLabel: tw`text-xs font-bold uppercase tracking-wide text-[#8792a8]`,
    detailValue: tw`mt-1 text-base font-extrabold text-[#25365d]`,
    saveError: tw`mb-3 mt-2 text-center text-sm font-semibold text-[#c33c4a]`,
    button: tw`mt-4 min-h-[58px] flex-row items-center justify-center rounded-2xl bg-[#168f68] py-4 shadow-sm`,
    buttonText: tw`text-lg font-black text-white`,
    buttonArrow: tw`ml-3 text-2xl font-bold text-white`,
};
