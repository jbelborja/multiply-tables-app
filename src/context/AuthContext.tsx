import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    onAuthStateChanged,
    signInAnonymously as firebaseSignInAnonymously,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithCredential,
    AuthCredential,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInAnonymously: () => Promise<void>;
    signInWithGoogleCredential: (credential: AuthCredential) => Promise<void>;
    signInWithEmail: (email: string, pass: string) => Promise<void>;
    signUp: (email: string, pass: string) => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("AuthContext: Setting up onAuthStateChanged listener");
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log("AuthContext: onAuthStateChanged triggered", user ? "User found" : "No user");
            setUser(user);
            setLoading(false);
        });

        // Force stop loading after 10 seconds if firebase doesn't respond to prevent infinite spinner
        const timeoutId = setTimeout(() => {
            setLoading((currentLoading) => {
                if (currentLoading) {
                    console.warn("AuthContext: Loading timed out (10s), forcing loading to false");
                    return false;
                }
                return currentLoading;
            });
        }, 10000);

        return () => {
            clearTimeout(timeoutId);
            unsubscribe();
        };
    }, []);

    const signInAnonymously = async () => {
        try {
            await firebaseSignInAnonymously(auth);
        } catch (error) {
            console.error('Anonymous sign in failed', error);
            throw error;
        }
    };

    const signInWithGoogleCredential = async (credential: AuthCredential) => {
        try {
            await signInWithCredential(auth, credential);
        } catch (error) {
            console.error('Google sign in failed', error);
            throw error;
        }
    };

    const signInWithEmail = async (email: string, pass: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            console.error('Email sign in failed', error);
            throw error;
        }
    };

    const signUp = async (email: string, pass: string) => {
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
        } catch (error) {
            console.error('Registration failed', error);
            throw error;
        }
    };

    const sendPasswordReset = async (email: string) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Password reset failed', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Logout failed', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signInAnonymously,
        signInWithGoogleCredential,
        signInWithEmail,
        signUp,
        sendPasswordReset,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
