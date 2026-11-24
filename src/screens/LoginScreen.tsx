import React, { useState } from 'react';
import { Text, View, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

import { theme } from '../styles/theme';
import tw from 'twrnc';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signInAnonymously, signInWithGoogleCredential, signInWithEmail, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setError('');
    setAuthLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Error al iniciar sesión: ' + (err.message || 'Error desconocido'));
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Check if running in Tauri
      const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;

      if (isTauri) {
        const isMobile = window.navigator.userAgent.includes('Android') || window.navigator.userAgent.includes('iPhone') || window.navigator.userAgent.includes('iPad');

        if (isMobile) {
          const { onOpenUrl } = await import('@tauri-apps/plugin-deep-link');
          const { openUrl } = await import('@tauri-apps/plugin-opener');

          const clientId = "364645965860-j2m30laq1notojgupjhqmuchq60q5n3p.apps.googleusercontent.com";
          const redirectUri = `com.googleusercontent.apps.364645965860-j2m30laq1notojgupjhqmuchq60q5n3p:/oauth2redirect`;

          const generateRandomString = (length: number) => {
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
            let result = '';
            for (let i = 0; i < length; i++) {
              result += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return result;
          };

          const sha256 = async (plain: string) => {
            const encoder = new TextEncoder();
            const data = encoder.encode(plain);
            const hash = await window.crypto.subtle.digest('SHA-256', data);
            return hash;
          };

          const base64urlencode = (a: ArrayBuffer) => {
            return btoa(String.fromCharCode.apply(null, new Uint8Array(a) as any))
              .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
          };

          const codeVerifier = generateRandomString(64);
          const codeChallenge = base64urlencode(await sha256(codeVerifier));

          const state = generateRandomString(16);
          const scope = encodeURIComponent('email profile openid');
          const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

          await onOpenUrl(async (urls) => {
            const url = urls[0];
            if (url && url.includes('code=')) {
              try {
                const params = new URLSearchParams(url.split('?')[1] || url.split('#')[1] || '');
                const code = params.get('code');
                const returnedState = params.get('state');

                if (code && returnedState === state) {
                  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                      client_id: clientId,
                      code: code,
                      code_verifier: codeVerifier,
                      grant_type: 'authorization_code',
                      redirect_uri: redirectUri,
                    }).toString(),
                  });

                  const tokens = await tokenResponse.json();
                  if (tokens.id_token) {
                    const credential = GoogleAuthProvider.credential(tokens.id_token, tokens.access_token);
                    await signInWithGoogleCredential(credential);
                  }
                }
              } catch (e) {
                console.error('Failed to handle OAuth redirect', e);
              }
            }
          });

          await openUrl(authUrl);
          return;
        }

        const { start, onUrl } = await import('@fabianlars/tauri-plugin-oauth');
        const { openUrl } = await import('@tauri-apps/plugin-opener');

        const clientId = "364645965860-sjietr9u3dcdvt8ieecekga0jp7ul37g.apps.googleusercontent.com";

        const unlisten = await onUrl(async (url: string) => {
          try {
            const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
            const accessToken = params.get('access_token');
            const idToken = params.get('id_token');

            if (accessToken || idToken) {
              const credential = GoogleAuthProvider.credential(idToken, accessToken);
              await signInWithGoogleCredential(credential);
            }
            unlisten();
          } catch (e) {
            console.error('Failed to handle OAuth redirect', e);
          }
        });

        const port = await start({ ports: [14200, 14201, 14202] });
        const redirectUri = `http://localhost:${port}`;
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=email%20profile%20openid`;

        await openUrl(authUrl);
        return;
      }

      // Web flow
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Error with Google sign in:', error);
      alert(`Error al iniciar con Google: ${error.message || error}`);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymously();
    } catch (error: any) {
      console.error('Anonymous sign in failed', error);
      alert(`Error de inicio anónimo: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>✖️</Text>
          </View>
          <Text style={styles.title}>MultiTable Hero</Text>
          <Text style={styles.subtitle}>Domina las tablas de multiplicar</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Iniciar Sesión</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              placeholder="tu@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, authLoading && styles.buttonDisabled]}
            onPress={handleEmailSignIn}
            disabled={authLoading}
          >
            {authLoading ? (
              <ActivityIndicator color={theme.colors.white} />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerLinkText}>¿No tienes cuenta? <Text style={styles.registerHighlight}>Regístrate</Text></Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>o continúa con</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={[styles.button, styles.googleButton]}
              onPress={handleGoogleSignIn}
            >
              <Text style={styles.googleButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.anonymousButton]}
              onPress={handleAnonymousSignIn}
            >
              <Text style={styles.anonymousButtonText}>Invitado</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = {
  container: tw`flex-1 bg-[#f9fafb]`,
  scrollContent: tw`min-h-full justify-center p-8`,
  loadingContainer: tw`flex-1 items-center justify-center bg-[#f9fafb]`,
  header: tw`mb-[30px] items-center`,
  logoContainer: tw`mb-4 h-[60px] w-[60px] items-center justify-center rounded-full bg-white shadow-md`,
  logoEmoji: tw`text-[30px]`,
  title: tw`text-center text-[32px] font-extrabold text-[#111827]`,
  subtitle: tw`text-center text-base text-[#4b5563]`,
  formCard: tw`rounded-2xl bg-white p-8 shadow-md`,
  formTitle: tw`mb-5 text-center text-2xl font-bold text-[#111827]`,
  errorText: tw`mb-4 text-center font-semibold text-[#ef4444]`,
  inputGroup: tw`mb-4`,
  label: tw`mb-1 text-sm font-bold text-[#4b5563]`,
  input: tw`rounded-xl border border-[#e5e7eb] p-3 text-base text-[#111827]`,
  forgotPassword: tw`mb-5 self-end`,
  forgotPasswordText: tw`text-sm font-semibold text-[#4f46e5]`,
  button: tw`items-center justify-center rounded-xl py-3.5 shadow-sm`,
  primaryButton: tw`bg-[#4f46e5]`,
  buttonDisabled: tw`opacity-70`,
  buttonText: tw`text-base font-bold text-white`,
  registerLink: tw`mt-5 items-center`,
  registerLinkText: tw`text-sm text-[#4b5563]`,
  registerHighlight: tw`font-bold text-[#4f46e5]`,
  dividerContainer: tw`my-6 flex-row items-center`,
  divider: tw`h-px flex-1 bg-[#e5e7eb]`,
  dividerText: tw`mx-2.5 text-xs text-[#9ca3af]`,
  socialButtons: tw`flex-row gap-4`,
  googleButton: tw`flex-1 border border-[#e5e7eb] bg-white`,
  googleButtonText: tw`font-semibold text-[#111827]`,
  anonymousButton: tw`flex-1 bg-[#7c3aed]`,
  anonymousButtonText: tw`font-semibold text-white`,
};
