import { PracticeMistake } from '../utils/PracticaEngine';

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    Main: undefined;
    Home: undefined;
    Practica: { mode: 'typed' | 'choice', tables: number[], reviewMistakes?: PracticeMistake[] };
    Summary: { score: number; total: number; mode: 'typed' | 'choice', tables: number[]; mistakes?: PracticeMistake[]; reviewedOperations?: string[]; practiceType?: 'standard' | 'errors' };
    Profile: undefined;
};
