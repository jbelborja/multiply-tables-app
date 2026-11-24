import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import tw from 'twrnc';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type Props = {
    navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({ navigation }: Props) {
    const [selectedTables, setSelectedTables] = useState<number[]>([1]);
    const [mode, setMode] = useState<'choice' | 'typed'>('choice');

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

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <Text style={styles.title}>MultiTable Hero</Text>
                <Text style={styles.subtitle}>Selecciona las tablas que quieres practicar</Text>
            </View>

            <View style={styles.grid}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <TouchableOpacity
                        key={num}
                        style={[
                            styles.tableButton,
                            selectedTables.includes(num) && styles.tableButtonSelected
                        ]}
                        onPress={() => toggleTable(num)}
                    >
                        <Text style={[
                            styles.tableButtonText,
                            selectedTables.includes(num) && styles.tableButtonTextSelected
                        ]}>
                            {num}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Modo de Juego</Text>
            </View>

            <View style={styles.modeContainer}>
                <TouchableOpacity
                    style={[styles.modeButton, mode === 'choice' && styles.modeButtonActive]}
                    onPress={() => setMode('choice')}
                >
                    <Text style={styles.modeIcon}>🎯</Text>
                    <Text style={[styles.modeText, mode === 'choice' && styles.modeTextActive]}>Elegir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.modeButton, mode === 'typed' && styles.modeButtonActive]}
                    onPress={() => setMode('typed')}
                >
                    <Text style={styles.modeIcon}>✍️</Text>
                    <Text style={[styles.modeText, mode === 'typed' && styles.modeTextActive]}>Escribir</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.startButton}
                onPress={handleStart}
            >
                <Text style={styles.startButtonText}>¡Comenzar Práctica!</Text>
            </TouchableOpacity>

            <View style={styles.infoCard}>
                <Text style={styles.infoText}>💡 Tip: Practica salteado para mejorar tu memoria muscular.</Text>
            </View>
        </ScrollView>
    );
}

const styles = {
    container: tw`flex-1 bg-[#f9fafb]`,
    scrollContent: tw`p-6`,
    header: tw`mt-8 mb-8`,
    title: tw`mb-1 text-[32px] font-extrabold text-[#111827]`,
    subtitle: tw`text-base text-[#4b5563]`,
    grid: tw`mb-8 flex-row flex-wrap justify-between gap-4`,
    tableButton: tw`aspect-square w-[30%] items-center justify-center rounded-xl border-2 border-transparent bg-white shadow-sm`,
    tableButtonSelected: tw`border-[#4338ca] bg-[#4f46e5]`,
    tableButtonText: tw`text-2xl font-bold text-[#4f46e5]`,
    tableButtonTextSelected: tw`text-white`,
    sectionHeader: tw`mb-4`,
    sectionTitle: tw`text-lg font-semibold text-[#111827]`,
    modeContainer: tw`mb-8 flex-row gap-4`,
    modeButton: tw`flex-1 items-center rounded-xl border-2 border-transparent bg-white p-4 shadow-sm`,
    modeButtonActive: tw`border-[#7c3aed] bg-[#f5f3ff]`,
    modeIcon: tw`mb-1 text-2xl`,
    modeText: tw`text-sm font-bold text-[#4b5563]`,
    modeTextActive: tw`text-[#7c3aed]`,
    startButton: tw`mb-8 items-center rounded-2xl bg-[#10b981] p-4 shadow-md`,
    startButtonText: tw`text-xl font-bold text-white`,
    infoCard: tw`mb-8 rounded-xl border-l-4 border-[#4f46e5] bg-white p-4 shadow-sm`,
    infoText: tw`text-sm text-[#4b5563]`,
};
