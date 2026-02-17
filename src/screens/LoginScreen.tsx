import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

import { theme } from '../styles/theme';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
    marginBottom: 15,
  },
  logoEmoji: {
    fontSize: 30,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.roundness.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.md,
  },
  formTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 5,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.lg,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    paddingVertical: 14,
    borderRadius: theme.roundness.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerLinkText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  registerHighlight: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: theme.colors.textLight,
    fontSize: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  googleButton: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  googleButtonText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  anonymousButton: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
  },
  anonymousButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
});
