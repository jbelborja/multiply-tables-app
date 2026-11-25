import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../styles/theme';
import tw from 'twrnc';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
    const { sendPasswordReset } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleReset = async () => {
        if (!email) {
            setError('Escribe tu correo electrónico para poder ayudarte.');
            return;
        }

        setError('');
        setMessage('');
        setLoading(true);
        try {
            await sendPasswordReset(email);
            setMessage('¡Listo! Te enviamos un enlace para crear una contraseña nueva. Revisa tu correo.');
        } catch (err: any) {
            console.error(err);
            setError('No pudimos enviar el correo. Comprueba la dirección e inténtalo otra vez.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.page}>
                <View style={styles.content}>
                    <Text style={styles.illustration}>🔐</Text>
                    <Text style={styles.eyebrow}>NO TE PREOCUPES</Text>
                    <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
                    <Text style={styles.subtitle}>
                        Escribe tu correo y te enviaremos un enlace para volver a entrar.
                    </Text>

                    <View style={styles.form}>
                        {error ? <Text style={styles.errorMessage}>{error}</Text> : null}
                        {message ? <Text style={styles.successMessage}>{message}</Text> : null}
                        <Text style={styles.label}>Correo electrónico</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="tu@correo.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleReset}
                            disabled={loading}
                            activeOpacity={0.82}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.colors.white} />
                            ) : (
                                <Text style={styles.buttonText}>Enviar enlace</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.linkText}>Volver a iniciar sesión</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = {
    container: tw`flex-1 bg-[#f5f8ff]`,
    scrollContent: tw`min-h-full justify-center px-4 py-6`,
    page: [tw`w-full self-center`, { maxWidth: 500 }],
    content: tw`items-center`,
    illustration: tw`mb-2 text-[48px]`,
    eyebrow: tw`text-[10px] font-black tracking-widest text-[#7046d8]`,
    title: tw`mb-2 mt-1 text-center text-[26px] font-black text-[#172554]`,
    subtitle: tw`mb-5 max-w-[390px] text-center text-sm leading-5 text-[#52617f]`,
    form: tw`w-full rounded-3xl border border-[#e7ecf6] bg-white p-5 shadow-sm`,
    label: tw`mb-2 text-sm font-bold text-[#465779]`,
    input: tw`mb-4 min-h-[52px] rounded-xl border border-[#dce4f2] bg-[#fbfcff] px-4 py-3 text-base text-[#172554]`,
    errorMessage: tw`mb-4 rounded-xl bg-[#fff1f2] p-3 text-sm font-semibold text-[#c33c4a]`,
    successMessage: tw`mb-4 rounded-xl bg-[#eaf9f2] p-3 text-sm font-semibold text-[#16835e]`,
    button: tw`min-h-[54px] items-center justify-center rounded-xl bg-[#168f68] p-4 shadow-sm`,
    buttonDisabled: tw`opacity-70`,
    buttonText: tw`text-base font-black text-white`,
    linkButton: tw`mt-4 items-center py-2`,
    linkText: tw`font-bold text-[#6045c5]`,
};
