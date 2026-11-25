import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { userService } from '../services/userService';

export interface PracticaResult {
    id: string;
    date: Date;
    score: number;
    total: number;
    mode: 'typed' | 'choice';
    tables: number[];
}

interface SessionContextType {
    history: PracticaResult[];
    addResult: (result: Omit<PracticaResult, 'id' | 'date'>) => Promise<void>;
    clearSession: () => void;
    loadingHistory: boolean;
    historyError: string | null;
    saveError: string | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState<PracticaResult[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        let isCurrentUser = true;
        setHistory([]);
        setHistoryError(null);
        setSaveError(null);

        if (!user) {
            setLoadingHistory(false);
            return;
        }

        setLoadingHistory(true);
        userService.getPracticaHistory(user.uid)
            .then(onlineHistory => {
                if (isCurrentUser) setHistory(onlineHistory);
            })
            .catch(error => {
                console.error('Failed to load history from Firestore:', error);
                if (isCurrentUser) {
                    setHistoryError('No se pudo cargar el historial. Comprueba la conexión e inténtalo de nuevo.');
                }
            })
            .finally(() => {
                if (isCurrentUser) setLoadingHistory(false);
            });

        return () => {
            isCurrentUser = false;
        };
    }, [user]);

    const addResult = async (result: Omit<PracticaResult, 'id' | 'date'>) => {
        const newResult: PracticaResult = {
            ...result,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date(),
        };

        // Update local state immediately
        setHistory((prev) => [newResult, ...prev]);

        // Save to Firebase if user is logged in
        if (user) {
            setSaveError(null);
            try {
                await userService.savePracticaResult(user.uid, result);
            } catch (error) {
                console.error('Failed to save result to Firebase:', error);
                setSaveError('No se pudo guardar esta sesión. Inténtalo de nuevo más tarde.');
            }
        } else {
            setSaveError('Inicia sesión con una cuenta para guardar tu historial.');
        }
    };

    const clearSession = () => {
        setHistory([]);
    };

    return (
        <SessionContext.Provider value={{ history, addResult, clearSession, loadingHistory, historyError, saveError }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};
