import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';
import tw from 'twrnc';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
    const { signUp } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            setError('Por favor, completa todos los campos.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setError('');
        setLoading(true);
        try {
            await signUp(email, password);
            // Auth state listener in App.tsx will redirect to Main
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Correo electrónico no válido.');
            } else {
                setError('Error al registrarse: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.headerEmoji}>🌈</Text>
                        <Text style={styles.eyebrow}>ÚNETE A LA AVENTURA</Text>
                        <Text style={styles.title}>¡Crea tu cuenta!</Text>
                        <Text style={styles.subtitle}>Guarda tus misiones y celebra todo lo que aprendes.</Text>
                    </View>

                    <View style={styles.form}>
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Correo electrónico</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="ejemplo@correo.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Contraseña</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Al menos 6 caracteres"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Repite tu contraseña</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Escríbela otra vez"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.82}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.colors.white} />
                            ) : (
                                <Text style={styles.buttonText}>¡Crear cuenta!</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.linkText}>¿Ya tienes cuenta? Entra aquí</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = {
    container: tw`flex-1 bg-[#f9fafb]`,
    scrollContent: tw`min-h-full justify-center px-4 py-6`,
    page: [tw`w-full self-center`, { maxWidth: 500 }],
    header: tw`mb-5 items-center rounded-3xl bg-[#e7f1ff] px-5 py-5`,
    headerEmoji: tw`mb-1 text-[42px]`,
    eyebrow: tw`text-[10px] font-black tracking-widest text-[#7046d8]`,
    title: tw`mb-1 mt-1 text-center text-[28px] font-black text-[#172554]`,
    subtitle: tw`text-center text-sm text-[#52617f]`,
    form: tw`rounded-3xl border border-[#e7ecf6] bg-white p-5 shadow-sm`,
    errorText: tw`mb-4 rounded-xl bg-[#fff1f2] p-3 text-center font-semibold text-[#c33c4a]`,
    inputContainer: tw`mb-4`,
    label: tw`mb-2 text-sm font-bold text-[#465779]`,
    input: tw`min-h-[52px] rounded-xl border border-[#dce4f2] bg-[#fbfcff] px-4 py-3 text-base text-[#172554]`,
    button: tw`mt-2 min-h-[54px] items-center justify-center rounded-xl bg-[#168f68] p-4 shadow-sm`,
    buttonDisabled: tw`opacity-70`,
    buttonText: tw`text-base font-black text-white`,
    linkButton: tw`mt-4 items-center py-2`,
    linkText: tw`font-semibold text-[#4f46e5]`,
};
