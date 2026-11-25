import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { PracticaEngine, PracticeMistake, Question } from '../utils/PracticaEngine';
import { theme } from '../styles/theme';
import tw from 'twrnc';

type Props = NativeStackScreenProps<RootStackParamList, 'Practica'>;

const STANDARD_QUESTION_COUNT = 10;

export default function PracticaScreen({ navigation, route }: Props) {
    const { mode, tables, reviewMistakes } = route.params;
    const isReviewMode = Boolean(reviewMistakes?.length);
    const { width } = useWindowDimensions();
    const isWide = width >= 760;
    const [engine] = useState(() => new PracticaEngine());
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [options, setOptions] = useState<number[]>([]);

    const [userAnswer, setUserAnswer] = useState('');
    const [questionCount, setQuestionCount] = useState(0);
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState<PracticeMistake[]>([]);
    const [reviewedOperations, setReviewedOperations] = useState<string[]>([]);
    const [status, setStatus] = useState<'answering' | 'correct' | 'incorrect'>('answering');
    const [feedback, setFeedback] = useState('');

    const loadNextQuestion = (nextIndex: number, currentQuestions: Question[]) => {
        if (nextIndex >= currentQuestions.length) {
            navigation.replace('Summary', {
                score,
                total: currentQuestions.length,
                mode,
                tables,
                mistakes,
                reviewedOperations,
                practiceType: isReviewMode ? 'errors' : 'standard',
            });
            return;
        }

        const q = currentQuestions[nextIndex];
        setCurrentQuestion(q);

        if (mode === 'choice') {
            setOptions(engine.generateOptions(q, 4, tables));
            setUserAnswer('');
        } else {
            setUserAnswer('');
        }

        setStatus('answering');
        setFeedback('');
        setQuestionCount(nextIndex + 1);
    };

    useEffect(() => {
        const generated = isReviewMode && reviewMistakes
            ? engine.generateQuestionsFromMistakes(reviewMistakes)
            : engine.generateUniqueQuestions(tables, STANDARD_QUESTION_COUNT);
        setQuestions(generated);
        if (generated.length > 0) {
            loadNextQuestion(0, generated);
        }
    }, []);

    const submitAnswer = (choiceAnswer?: number | string) => {
        if (!currentQuestion || status !== 'answering') return;

        const answerToUse = choiceAnswer !== undefined ? choiceAnswer : userAnswer;
        const isCorrect = engine.checkAnswer(currentQuestion, answerToUse);
        if (isReviewMode) {
            setReviewedOperations(prev => [...prev, `${currentQuestion.a}x${currentQuestion.b}`]);
        }

        if (isCorrect) {
            setScore(prev => prev + 1);
            setStatus('correct');
            setFeedback('¡Muy bien! ¡Correcto!');
        } else {
            setStatus('incorrect');
            setFeedback(`Vaya... La respuesta era: ${currentQuestion.correctAnswer}`);
            setMistakes(prev => [...prev, {
                a: currentQuestion.a,
                b: currentQuestion.b,
                answer: String(answerToUse),
                correctAnswer: currentQuestion.correctAnswer,
            }]);
        }
    };

    const handleNext = () => {
        loadNextQuestion(questionCount, questions);
    };

    if (!currentQuestion) return null;

    const totalQuestions = questions.length;
    const progress = questionCount / totalQuestions;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.page}>
                    <View style={styles.topSection}>
                        <View style={styles.progressHeader}>
                            <View>
                                <Text style={styles.eyebrow}>{isReviewMode ? '🧠 ¡Entrenamiento especial!' : '⚡ ¡Misión en marcha!'}</Text>
                                <Text style={styles.counterText}>Pregunta {questionCount} de {totalQuestions}</Text>
                            </View>
                            <View style={styles.scorePill}>
                                <Text style={styles.scoreText}>⭐ {score} {score === 1 ? 'acierto' : 'aciertos'}</Text>
                            </View>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                        </View>
                    </View>

                    <View style={[styles.card, isWide && styles.cardWide]}>
                        <View style={styles.questionHeader}>
                            <Text style={styles.promptLabel}>RESUELVE EL RETO</Text>
                            <Text style={styles.mathIcon}>✖️</Text>
                        </View>
                        <Text style={[styles.promptText, isWide && styles.promptTextWide]}>
                            {currentQuestion.prompt}
                        </Text>

                        <View style={styles.divider} />

                        {mode === 'typed' ? (
                            <View style={styles.typedContainer}>
                                <Text style={styles.inputHint}>Escribe el resultado aquí</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        status === 'correct' && styles.inputCorrect,
                                        status === 'incorrect' && styles.inputIncorrect
                                    ]}
                                    value={userAnswer}
                                    onChangeText={setUserAnswer}
                                    placeholder="Tu respuesta"
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
                                            textStyle = [textStyle, styles.optionTextOnColor];
                                        } else if (isSelected) {
                                            buttonStyles.push(styles.optionButtonIncorrect);
                                            textStyle = [textStyle, styles.optionTextOnColor];
                                        }
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            accessibilityRole="button"
                                            style={buttonStyles}
                                            onPress={() => {
                                                setUserAnswer(opt.toString());
                                                submitAnswer(opt);
                                            }}
                                            disabled={status !== 'answering'}
                                            activeOpacity={0.78}
                                        >
                                            <Text style={styles.optionEmoji}>{['🌟', '🚀', '🪄', '🦄'][index % 4]}</Text>
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
                                <Text style={styles.feedbackEmoji}>{status === 'correct' ? '🎉' : '💪'}</Text>
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
                                        activeOpacity={0.82}
                                    >
                                        <Text style={styles.buttonText}>Comprobar respuesta</Text>
                                    </TouchableOpacity>
                                )
                            ) : (
                                <TouchableOpacity
                                    style={[styles.mainButton, styles.nextButton]}
                                    onPress={handleNext}
                                    activeOpacity={0.82}
                                >
                                    <Text style={styles.buttonText}>
                                        {questionCount >= totalQuestions ? 'Ver mis resultados' : 'Siguiente reto'}
                                    </Text>
                                    <Text style={styles.buttonArrow}>→</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = {
    container: tw`flex-1 bg-[#f5f8ff]`,
    scrollContent: tw`px-4 pb-10 pt-5`,
    page: [tw`w-full self-center`, { maxWidth: 880 }],
    topSection: tw`mb-5`,
    progressHeader: tw`mb-3 flex-row items-center justify-between`,
    eyebrow: tw`mb-1 text-sm font-bold text-[#7046d8]`,
    counterText: tw`text-base font-extrabold text-[#172554]`,
    scorePill: tw`rounded-full bg-[#fff1c2] px-4 py-2`,
    scoreText: tw`text-sm font-extrabold text-[#815c00]`,
    progressBarBg: tw`h-3 overflow-hidden rounded-full bg-[#e4eaf5]`,
    progressBarFill: tw`h-full rounded-full bg-[#52c79a]`,
    card: tw`rounded-3xl border border-[#e7ecf6] bg-white p-5 shadow-sm`,
    cardWide: tw`p-8`,
    questionHeader: tw`flex-row items-center justify-between`,
    promptLabel: tw`text-xs font-extrabold tracking-widest text-[#73809a]`,
    mathIcon: tw`text-xl`,
    promptText: tw`my-4 text-center text-[42px] font-black text-[#172554]`,
    promptTextWide: tw`my-5 text-[56px]`,
    divider: tw`mb-5 h-px bg-[#edf0f7]`,
    typedContainer: tw`mb-5`,
    inputHint: tw`mb-3 text-center text-sm font-semibold text-[#73809a]`,
    input: tw`min-h-[64px] rounded-2xl border-2 border-[#dce4f2] bg-[#f8faff] p-4 text-center text-3xl font-bold text-[#172554]`,
    inputCorrect: tw`border-[#35b989] bg-[#effbf6]`,
    inputIncorrect: tw`border-[#ee7480] bg-[#fff2f3]`,
    optionsContainer: tw`mb-5 flex-row flex-wrap justify-between gap-3`,
    optionButton: tw`min-h-[88px] w-[48%] flex-row items-center justify-center rounded-2xl border-2 border-[#e7ecf6] bg-[#fbfcff] p-4`,
    optionButtonCorrect: tw`border-[#35b989] bg-[#35b989]`,
    optionButtonIncorrect: tw`border-[#ee7480] bg-[#ee7480]`,
    optionEmoji: tw`mr-2 text-xl`,
    optionText: tw`text-2xl font-black text-[#25365d]`,
    optionTextOnColor: tw`text-white`,
    feedbackBox: tw`mb-5 flex-row items-center justify-center rounded-2xl p-4`,
    feedbackBoxCorrect: tw`bg-[#eaf9f2]`,
    feedbackBoxIncorrect: tw`bg-[#fff1e8]`,
    feedbackEmoji: tw`mr-2 text-2xl`,
    feedbackText: tw`text-center text-base font-extrabold text-[#25365d]`,
    actionContainer: tw`mt-1`,
    mainButton: tw`min-h-[58px] flex-row items-center justify-center rounded-2xl bg-[#168f68] p-4 shadow-sm`,
    nextButton: tw`bg-[#7154d9]`,
    buttonDisabled: tw`bg-[#aeb8cc] opacity-60`,
    buttonText: tw`text-base font-black text-white`,
    buttonArrow: tw`ml-3 text-xl font-bold text-white`,
};
