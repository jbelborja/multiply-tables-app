import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PracticaEngine, Question } from '../utils/PracticaEngine';
import { theme } from '../styles/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Practica'>;

const TOTAL_QUESTIONS = 10;

export default function PracticaScreen({ navigation, route }: Props) {
    const { mode, tables } = route.params;
    const [engine] = useState(() => new PracticaEngine());
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [options, setOptions] = useState<number[]>([]);

    const [userAnswer, setUserAnswer] = useState('');
    const [questionCount, setQuestionCount] = useState(0);
    const [score, setScore] = useState(0);
    const [status, setStatus] = useState<'answering' | 'correct' | 'incorrect'>('answering');
    const [feedback, setFeedback] = useState('');

    const loadNextQuestion = (nextIndex: number, currentQuestions: Question[]) => {
        if (nextIndex >= TOTAL_QUESTIONS || nextIndex >= currentQuestions.length) {
            navigation.replace('Summary', { score, total: TOTAL_QUESTIONS, mode, tables });
            return;
        }

        const q = currentQuestions[nextIndex];
        setCurrentQuestion(q);

        if (mode === 'choice') {
            setOptions(engine.generateOptions(q));
            setUserAnswer('');
        } else {
            setUserAnswer('');
        }

        setStatus('answering');
        setFeedback('');
        setQuestionCount(nextIndex + 1);
    };

    useEffect(() => {
        const generated = engine.generateUniqueQuestions(tables, TOTAL_QUESTIONS);
        setQuestions(generated);
        if (generated.length > 0) {
            loadNextQuestion(0, generated);
        }
    }, []);

    const submitAnswer = (choiceAnswer?: number | string) => {
        if (!currentQuestion) return;

        const answerToUse = choiceAnswer !== undefined ? choiceAnswer : userAnswer;
        const isCorrect = engine.checkAnswer(currentQuestion, answerToUse);

        if (isCorrect) {
            setScore(prev => prev + 1);
            setStatus('correct');
            setFeedback('¡Muy bien! ¡Correcto!');
        } else {
            setStatus('incorrect');
            setFeedback(`Vaya... La respuesta era: ${currentQuestion.correctAnswer}`);
        }
    };

    const handleNext = () => {
        loadNextQuestion(questionCount, questions);
    };

    if (!currentQuestion) return null;

    const progress = (questionCount / TOTAL_QUESTIONS);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.topSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.counterText}>Pregunta {questionCount} de {TOTAL_QUESTIONS}</Text>
                        <Text style={styles.scoreText}>Aciertos: {score}</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.promptLabel}>¿Cuánto es?</Text>
                    <Text style={styles.promptText}>
                        {currentQuestion.prompt}
                    </Text>

                    <View style={styles.divider} />

                    {mode === 'typed' ? (
                        <View style={styles.typedContainer}>
                            <TextInput
                                style={[
                                    styles.input,
                                    status === 'correct' && styles.inputCorrect,
                                    status === 'incorrect' && styles.inputIncorrect
                                ]}
                                value={userAnswer}
                                onChangeText={setUserAnswer}
                                placeholder="Escribe el resultado..."
                                keyboardType="number-pad"
                                autoFocus={true}
                                editable={status === 'answering'}
                                onSubmitEditing={() => submitAnswer()}
                            />
                        </View>
                    ) : (
                        <View style={styles.optionsContainer}>
                            {options.map((opt, index) => {
                                const buttonStyles: any[] = [styles.optionButton];
                                let textStyle: any = styles.optionText;

                                if (status !== 'answering') {
                                    const isSelected = opt.toString() === userAnswer || opt === (typeof userAnswer === 'number' ? userAnswer : parseInt(userAnswer, 10));
                                    const isActuallyCorrect = opt === currentQuestion.correctAnswer;

                                    if (isActuallyCorrect) {
                                        buttonStyles.push(styles.optionButtonCorrect);
                                        textStyle = [textStyle, { color: theme.colors.white }];
                                    } else if (isSelected) {
                                        buttonStyles.push(styles.optionButtonIncorrect);
                                        textStyle = [textStyle, { color: theme.colors.white }];
                                    }
                                }

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={buttonStyles}
                                        onPress={() => {
                                            setUserAnswer(opt.toString());
                                            submitAnswer(opt);
                                        }}
                                        disabled={status !== 'answering'}
                                    >
                                        <Text style={textStyle}>{opt}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {status !== 'answering' && (
                        <View style={[
                            styles.feedbackBox,
                            status === 'correct' ? styles.feedbackBoxCorrect : styles.feedbackBoxIncorrect
                        ]}>
                            <Text style={styles.feedbackText}>{feedback}</Text>
                        </View>
                    )}

                    <View style={styles.actionContainer}>
                        {status === 'answering' ? (
                            mode === 'typed' && (
                                <TouchableOpacity
                                    style={[styles.mainButton, !userAnswer.trim() && styles.buttonDisabled]}
                                    onPress={() => submitAnswer()}
                                    disabled={!userAnswer.trim()}
                                >
                                    <Text style={styles.buttonText}>Comprobar</Text>
                                </TouchableOpacity>
                            )
                        ) : (
                            <TouchableOpacity style={[styles.mainButton, { backgroundColor: theme.colors.secondary }]} onPress={handleNext}>
                                <Text style={styles.buttonText}>
                                    {questionCount >= TOTAL_QUESTIONS ? 'Ver Resultados' : 'Siguiente'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xl * 2,
    },
    topSection: {
        marginBottom: theme.spacing.lg,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.sm,
    },
    counterText: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    scoreText: {
        ...theme.typography.caption,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: theme.colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.roundness.xl,
        padding: theme.spacing.xl,
        ...theme.shadows.md,
    },
    promptLabel: {
        ...theme.typography.caption,
        color: theme.colors.textLight,
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    },
    promptText: {
        ...theme.typography.h1,
        fontSize: 48,
        color: theme.colors.text,
        marginVertical: theme.spacing.md,
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: theme.spacing.lg,
    },
    typedContainer: {
        marginBottom: theme.spacing.lg,
    },
    input: {
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: theme.roundness.lg,
        padding: theme.spacing.md,
        fontSize: 24,
        textAlign: 'center',
        color: theme.colors.text,
        backgroundColor: theme.colors.background,
    },
    inputCorrect: {
        borderColor: theme.colors.success,
        backgroundColor: '#ECFDF5',
    },
    inputIncorrect: {
        borderColor: theme.colors.error,
        backgroundColor: '#FEF2F2',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
    },
    optionButton: {
        width: '45%',
        backgroundColor: theme.colors.white,
        padding: theme.spacing.lg,
        borderRadius: theme.roundness.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    optionButtonCorrect: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
    },
    optionButtonIncorrect: {
        backgroundColor: theme.colors.error,
        borderColor: theme.colors.error,
    },
    optionText: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    feedbackBox: {
        padding: theme.spacing.md,
        borderRadius: theme.roundness.lg,
        marginBottom: theme.spacing.lg,
        alignItems: 'center',
    },
    feedbackBoxCorrect: {
        backgroundColor: '#ECFDF5',
    },
    feedbackBoxIncorrect: {
        backgroundColor: '#FEF2F2',
    },
    feedbackText: {
        ...theme.typography.body,
        fontWeight: 'bold',
        textAlign: 'center',
        color: theme.colors.text,
    },
    actionContainer: {
        marginTop: theme.spacing.xs,
    },
    mainButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.roundness.lg,
        alignItems: 'center',
        ...theme.shadows.sm,
    },
    buttonDisabled: {
        backgroundColor: theme.colors.textLight,
        opacity: 0.5,
    },
    buttonText: {
        color: theme.colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
