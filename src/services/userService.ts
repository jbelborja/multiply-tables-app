import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp,
    limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PracticaResult } from '../context/SessionContext';

export const userService = {
    /**
     * Saves a practica result to Firestore
     */
    async savePracticaResult(userId: string, result: Omit<PracticaResult, 'id' | 'date'>) {
        try {
            const resultsRef = collection(db, 'users', userId, 'results');
            await addDoc(resultsRef, {
                ...result,
                date: Timestamp.now(),
            });
            console.log('Practica result saved to Firestore');
        } catch (error) {
            console.error('Error saving practica result to Firestore:', error);
            throw error;
        }
    },

    /**
     * Fetches the quiz history for a user
     */
    async getPracticaHistory(userId: string): Promise<PracticaResult[]> {
        const resultsRef = collection(db, 'users', userId, 'results');
        const q = query(resultsRef, orderBy('date', 'desc'), limit(50));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                score: data.score,
                total: data.total,
                mode: data.mode,
                tables: data.tables || [],
                mistakes: data.mistakes || [],
                reviewedOperations: data.reviewedOperations || [],
                practiceType: data.practiceType || 'standard',
                date: data.date instanceof Timestamp ? data.date.toDate() : new Date(data.date),
            } as PracticaResult;
        });
    }
};
