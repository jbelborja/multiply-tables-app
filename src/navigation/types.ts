export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    Main: undefined;
    Home: undefined;
    Practica: { mode: 'typed' | 'choice', tables: number[] };
    Summary: { score: number; total: number; mode: 'typed' | 'choice', tables: number[] };
    Profile: undefined;
};
