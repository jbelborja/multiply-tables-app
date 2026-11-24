import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
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

    const handleReset = async () => {
        if (!email) {
            Alert.alert('Error', 'Por favor, ingresa tu correo electrónico.');
            return;
        }

        setLoading(true);
        try {
            await sendPasswordReset(email);
            Alert.alert(
                'Correo Enviado',
                'Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (err: any) {
            console.error(err);
            Alert.alert('Error', 'No se pudo enviar el correo: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>
                <Text style={styles.subtitle}>
                    Ingresa tu correo electrónico y te enviaremos un enlace para recuperarla.
                </Text>

                <View style={styles.form}>
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
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.white} />
                        ) : (
                            <Text style={styles.buttonText}>Enviar Enlace</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.linkText}>Volver al inicio de sesión</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = {
    container: tw`flex-1 justify-center bg-[#f9fafb] p-8`,
    content: tw`items-center`,
    title: tw`mb-2.5 text-center text-2xl font-bold text-[#111827]`,
    subtitle: tw`mb-[30px] text-center text-base text-[#4b5563]`,
    form: tw`w-full rounded-2xl bg-white p-8 shadow-md`,
    input: tw`mb-5 rounded-xl border border-[#e5e7eb] p-3 text-base text-[#111827]`,
    button: tw`items-center rounded-xl bg-[#4f46e5] p-4 shadow-sm`,
    buttonDisabled: tw`opacity-70`,
    buttonText: tw`text-lg font-bold text-white`,
    linkButton: tw`mt-5 items-center`,
    linkText: tw`font-semibold text-[#4f46e5]`,
};
