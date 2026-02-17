import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: theme.spacing.lg,
    },
    header: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    tableButton: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: theme.colors.white,
        borderRadius: theme.roundness.lg,
        justifyContent: 'center',
        alignItems: 'center',
        ...theme.shadows.sm,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    tableButtonSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primaryDark,
    },
    tableButtonText: {
        ...theme.typography.h2,
        color: theme.colors.primary,
    },
    tableButtonTextSelected: {
        color: theme.colors.white,
    },
    sectionHeader: {
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
    },
    modeContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    modeButton: {
        flex: 1,
        backgroundColor: theme.colors.white,
        borderRadius: theme.roundness.lg,
        padding: theme.spacing.md,
        alignItems: 'center',
        ...theme.shadows.sm,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    modeButtonActive: {
        borderColor: theme.colors.secondary,
        backgroundColor: '#F5F3FF',
    },
    modeIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    modeText: {
        ...theme.typography.caption,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
    },
    modeTextActive: {
        color: theme.colors.secondary,
    },
    startButton: {
        backgroundColor: theme.colors.success,
        padding: theme.spacing.md,
        borderRadius: theme.roundness.xl,
        alignItems: 'center',
        ...theme.shadows.md,
        marginBottom: theme.spacing.xl,
    },
    startButtonText: {
        color: theme.colors.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    infoCard: {
        backgroundColor: theme.colors.white,
        padding: theme.spacing.md,
        borderRadius: theme.roundness.lg,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
        ...theme.shadows.sm,
        marginBottom: theme.spacing.xl,
    },
    infoText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
});
