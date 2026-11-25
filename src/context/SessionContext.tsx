import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { userService } from '../services/userService';
import { PracticeMistake } from '../utils/PracticaEngine';

export interface PracticaResult {
    id: string;
    date: Date;
    score: number;
    total: number;
    mode: 'typed' | 'choice';
    tables: number[];
    mistakes?: PracticeMistake[];
    reviewedOperations?: string[];
    practiceType?: 'standard' | 'errors';
}

interface SessionContextType {
    history: PracticaResult[];
    recentMistakes: PracticeMistake[];
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
    const recentMistakes = history.reduce<{ mistakes: PracticeMistake[]; seen: Set<string> }>((recent, result) => {
        const mistakesByOperation = new Map(
            (result.mistakes ?? []).map(mistake => [`${mistake.a}x${mistake.b}`, mistake]),
        );
        const operations = result.practiceType === 'errors' && result.reviewedOperations
            ? [...result.reviewedOperations].reverse()
            : [...mistakesByOperation.keys()].reverse();

        for (const operation of operations) {
            if (recent.mistakes.length >= 10) return recent;
            if (recent.seen.has(operation)) continue;
            recent.seen.add(operation);
            const mistake = mistakesByOperation.get(operation);
            if (mistake) recent.mistakes.push(mistake);
        }
        return recent;
    }, { mistakes: [], seen: new Set<string>() }).mistakes;

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

    const addResult = useCallback(async (result: Omit<PracticaResult, 'id' | 'date'>) => {
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
    }, [user]);

    const clearSession = () => {
        setHistory([]);
    };

    return (
        <SessionContext.Provider value={{ history, recentMistakes, addResult, clearSession, loadingHistory, historyError, saveError }}>
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
