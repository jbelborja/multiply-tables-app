import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import heroIcon from '../../assets/icon.png';
import { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';
import tw from 'twrnc';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
    navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
    const [selectedTables, setSelectedTables] = useState<number[]>([1]);
    const [mode, setMode] = useState<'choice' | 'typed'>('choice');
    const { recentMistakes } = useSession();
    const { width } = useWindowDimensions();
    const isWide = width >= 820;

    const toggleTable = (num: number) => {
        if (selectedTables.includes(num)) {
            if (selectedTables.length > 1) {
                setSelectedTables(selectedTables.filter(n => n !== num));
            }
        } else {
            setSelectedTables([...selectedTables, num].sort((a, b) => a - b));
        }
    };

    const handleStart = () => {
        navigation.navigate('Practica', { mode, tables: selectedTables });
    };

    const handleReviewMistakes = () => {
        const tables = [...new Set(recentMistakes.map(mistake => mistake.a))].sort((a, b) => a - b);
        navigation.navigate('Practica', { mode, tables, reviewMistakes: recentMistakes });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.page}>
                <View style={styles.hero}>
                    <View style={styles.heroCopy}>
                        <Text style={styles.eyebrow}>🚀 ¡Tu próxima misión!</Text>
                        <Text style={styles.title}>¡A por las tablas!</Text>
                        <Text style={styles.subtitle}>Elige tus tablas y prepárate para convertirte en una estrella de las mates.</Text>
                    </View>
                    <View style={styles.heroArt}>
                        <Image
                            source={{ uri: heroIcon }}
                            style={styles.heroIcon}
                            accessibilityLabel="Icono de MultiTable Hero"
                        />
                    </View>
                </View>

                <View style={[styles.setup, isWide && styles.setupWide]}>
                    <View style={[styles.sectionCard, isWide && styles.sectionCardWide]}>
                        <View style={styles.sectionHeading}>
                            <View style={styles.stepBadge}><Text style={styles.stepText}>1</Text></View>
                            <View>
                                <Text style={styles.sectionTitle}>Elige tus tablas</Text>
                                <Text style={styles.sectionHint}>Puedes elegir más de una</Text>
                            </View>
                        </View>
                        <View style={styles.grid}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                                const selected = selectedTables.includes(num);
                                return (
                                    <TouchableOpacity
                                        key={num}
                                        accessibilityRole="button"
                                        accessibilityState={{ selected }}
                                        style={[styles.tableButton, selected && styles.tableButtonSelected]}
                                        onPress={() => toggleTable(num)}
                                        activeOpacity={0.78}
                                    >
                                        <Text style={[styles.tableButtonText, selected && styles.tableButtonTextSelected]}>
                                            {num}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <Text style={styles.selectionNote}>⭐ {selectedTables.length} {selectedTables.length === 1 ? 'tabla elegida' : 'tablas elegidas'}</Text>
                    </View>

                    <View style={styles.rightColumn}>
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeading}>
                                <View style={[styles.stepBadge, styles.stepBadgePurple]}><Text style={styles.stepText}>2</Text></View>
                                <View>
                                    <Text style={styles.sectionTitle}>¿Cómo quieres jugar?</Text>
                                    <Text style={styles.sectionHint}>Escoge tu reto favorito</Text>
                                </View>
                            </View>
                            <View style={styles.modeContainer}>
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: mode === 'choice' }}
                                    style={[styles.modeButton, mode === 'choice' && styles.modeButtonActive]}
                                    onPress={() => setMode('choice')}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modeIcon}>🎯</Text>
                                    <Text style={[styles.modeText, mode === 'choice' && styles.modeTextActive]}>Elegir respuesta</Text>
                                    <Text style={styles.modeHint}>¡Acierta entre varias!</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: mode === 'typed' }}
                                    style={[styles.modeButton, mode === 'typed' && styles.modeButtonActive]}
                                    onPress={() => setMode('typed')}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modeIcon}>✍️</Text>
                                    <Text style={[styles.modeText, mode === 'typed' && styles.modeTextActive]}>Escribir respuesta</Text>
                                    <Text style={styles.modeHint}>¡Tú sabes el resultado!</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.tipCard}>
                            <Text style={styles.tipIcon}>💡</Text>
                            <View style={styles.tipCopy}>
                                <Text style={styles.tipTitle}>Truco de héroe</Text>
                                <Text style={styles.tipText}>Practica las tablas en distinto orden para que se queden en tu memoria.</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.82}>
                    <Text style={styles.startButtonText}>¡Empezar misión!</Text>
                    <Text style={styles.startArrow}>→</Text>
                </TouchableOpacity>

                {recentMistakes.length > 0 && (
                    <TouchableOpacity style={styles.reviewButton} onPress={handleReviewMistakes} activeOpacity={0.82}>
                        <Text style={styles.reviewEmoji}>🧠</Text>
                        <View style={styles.reviewCopy}>
                            <Text style={styles.reviewTitle}>Entrenar mis retos difíciles</Text>
                            <Text style={styles.reviewSubtitle}>
                                Practica {recentMistakes.length} {recentMistakes.length === 1 ? 'operación que quieres dominar' : 'operaciones que quieres dominar'}.
                            </Text>
                        </View>
                        <Text style={styles.reviewArrow}>→</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = {
    container: tw`flex-1 bg-[#f5f8ff]`,
    scrollContent: tw`px-4 pb-8 pt-5`,
    page: [tw`w-full self-center`, { maxWidth: 1120 }],
    hero: tw`mb-6 flex-row items-center justify-between overflow-hidden rounded-[28px] bg-[#e7f1ff] px-5 py-6`,
    heroCopy: tw`flex-1`,
    eyebrow: tw`mb-2 text-sm font-bold text-[#315b9a]`,
    title: tw`mb-2 text-[32px] font-black text-[#172554]`,
    subtitle: tw`max-w-[520px] text-base leading-6 text-[#465779]`,
    heroArt: tw`ml-2 h-[100px] w-[100px] items-center justify-center rounded-full bg-[#d5e7ff]`,
    heroIcon: tw`h-[76px] w-[76px] rounded-2xl`,
    setup: tw`gap-5`,
    setupWide: tw`flex-row items-start`,
    sectionCard: tw`mb-5 rounded-3xl border border-[#e7ecf6] bg-white p-5 shadow-sm`,
    sectionCardWide: tw`flex-1`,
    sectionHeading: tw`mb-5 flex-row items-center`,
    stepBadge: tw`mr-3 h-10 w-10 items-center justify-center rounded-full bg-[#dff8ef]`,
    stepBadgePurple: tw`bg-[#eee7ff]`,
    stepText: tw`text-lg font-black text-[#16835e]`,
    sectionTitle: tw`text-lg font-extrabold text-[#172554]`,
    sectionHint: tw`mt-0.5 text-sm text-[#73809a]`,
    grid: tw`flex-row flex-wrap justify-between gap-3`,
    tableButton: tw`aspect-square w-[30%] items-center justify-center rounded-2xl border-2 border-[#e7ecf6] bg-[#f8faff]`,
    tableButtonSelected: tw`border-[#4f6df5] bg-[#4f6df5] shadow-md`,
    tableButtonText: tw`text-2xl font-black text-[#52658c]`,
    tableButtonTextSelected: tw`text-white`,
    selectionNote: tw`mt-4 text-sm font-bold text-[#52658c]`,
    rightColumn: tw`flex-1`,
    modeContainer: tw`gap-3`,
    modeButton: tw`mb-1 flex-row flex-wrap items-center rounded-2xl border-2 border-[#e7ecf6] bg-[#fbfcff] p-4`,
    modeButtonActive: tw`border-[#8b6cf6] bg-[#f5f1ff]`,
    modeIcon: tw`mr-3 text-3xl`,
    modeText: tw`text-base font-extrabold text-[#465779]`,
    modeTextActive: tw`text-[#7046d8]`,
    modeHint: tw`ml-12 mt-1 w-full text-sm text-[#73809a]`,
    tipCard: tw`mb-5 flex-row items-start rounded-2xl bg-[#fff6da] p-4`,
    tipIcon: tw`mr-3 text-2xl`,
    tipCopy: tw`flex-1`,
    tipTitle: tw`mb-1 text-sm font-extrabold text-[#815c00]`,
    tipText: tw`text-sm leading-5 text-[#78653a]`,
    startButton: tw`mt-1 min-h-[58px] flex-row items-center justify-center rounded-2xl bg-[#19a879] px-5 py-4 shadow-md`,
    startButtonText: tw`text-lg font-black text-white`,
    startArrow: tw`ml-3 text-2xl font-bold text-white`,
    reviewButton: tw`mt-3 flex-row items-center rounded-2xl border-2 border-[#d9cef9] bg-[#f5f1ff] p-4`,
    reviewEmoji: tw`mr-3 text-3xl`,
    reviewCopy: tw`flex-1`,
    reviewTitle: tw`text-base font-extrabold text-[#5236a6]`,
    reviewSubtitle: tw`mt-1 text-sm text-[#75659f]`,
    reviewArrow: tw`ml-2 text-2xl font-bold text-[#7046d8]`,
};
