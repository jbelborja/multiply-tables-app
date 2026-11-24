import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PracticaEngine, Question } from '../utils/PracticaEngine';
import { theme } from '../styles/theme';
import tw from 'twrnc';

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

const styles = {
    container: tw`flex-1 bg-[#f9fafb]`,
    scrollContent: tw`p-6 pb-16`,
    topSection: tw`mb-6`,
    progressHeader: tw`mb-2 flex-row justify-between`,
    counterText: tw`text-sm text-[#4b5563]`,
    scoreText: tw`text-sm font-bold text-[#4f46e5]`,
    progressBarBg: tw`h-2 overflow-hidden rounded bg-[#e5e7eb]`,
    progressBarFill: tw`h-full bg-[#4f46e5]`,
    card: tw`rounded-2xl bg-white p-8 shadow-md`,
    promptLabel: tw`text-center text-sm uppercase tracking-widest text-[#9ca3af]`,
    promptText: tw`my-4 text-center text-[48px] font-extrabold text-[#111827]`,
    divider: tw`mb-6 h-px bg-[#e5e7eb]`,
    typedContainer: tw`mb-6`,
    input: tw`rounded-xl border-2 border-[#e5e7eb] bg-[#f9fafb] p-4 text-center text-2xl text-[#111827]`,
    inputCorrect: tw`border-[#10b981] bg-[#ecfdf5]`,
    inputIncorrect: tw`border-[#ef4444] bg-[#fef2f2]`,
    optionsContainer: tw`mb-6 flex-row flex-wrap justify-between gap-4`,
    optionButton: tw`w-[45%] items-center rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-sm`,
    optionButtonCorrect: tw`border-[#10b981] bg-[#10b981]`,
    optionButtonIncorrect: tw`border-[#ef4444] bg-[#ef4444]`,
    optionText: tw`text-2xl font-bold text-[#111827]`,
    feedbackBox: tw`mb-6 items-center rounded-xl p-4`,
    feedbackBoxCorrect: tw`bg-[#ecfdf5]`,
    feedbackBoxIncorrect: tw`bg-[#fef2f2]`,
    feedbackText: tw`text-center text-base font-bold text-[#111827]`,
    actionContainer: tw`mt-1`,
    mainButton: tw`items-center rounded-xl bg-[#4f46e5] p-4 shadow-sm`,
    buttonDisabled: tw`bg-[#9ca3af] opacity-50`,
    buttonText: tw`text-lg font-bold text-white`,
};
