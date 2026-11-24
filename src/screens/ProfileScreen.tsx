import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSession, PracticaResult } from '../context/SessionContext';
import { theme } from '../styles/theme';
import tw from 'twrnc';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { history, loadingHistory } = useSession();

    if (loadingHistory) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Cargando historial...</Text>
            </View>
        );
    }

    const renderItem = ({ item }: { item: PracticaResult }) => {
        // Ensure item.date is a Date object
        const date = item.date instanceof Date ? item.date : new Date(item.date);

        return (
            <View style={styles.historyItem}>
                <View>
                    <Text style={styles.historyDate}>{date.toLocaleDateString()} - {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    <Text style={styles.historyMode}>
                        {item.mode === 'typed' ? 'Escribir' : 'Elegir'}
                    </Text>
                </View>
                <View style={styles.scoreBadge}>
                    <Text style={styles.historyScore}>
                        {item.score}/{item.total}
                    </Text>
                </View>
            </View>
        );
    };

    const userInitial = user?.email ? user.email[0].toUpperCase() : '?';

    return (
        <View style={styles.container}>
            <View style={styles.userHeader}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.secondary }]}>
                    <Text style={styles.avatarText}>{userInitial}</Text>
                </View>
                <Text style={styles.emailText}>
                    {user?.isAnonymous ? 'Usuario Anónimo' : user?.email}
                </Text>
                <Text style={styles.statsLabel}>Has completado {history.length} sesiones</Text>

                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <Text style={styles.logoutText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.historySection}>
                <Text style={styles.sectionTitle}>Historial Completo</Text>

                {history.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Todavía no has realizado ejercicios.</Text>
                        <Text style={styles.emptySubtext}>¡Comienza uno ahora desde la pantalla de inicio!</Text>
                    </View>
                ) : (
                    <FlatList
                        data={history}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </View>
    );
}

const styles = {
    container: tw`flex-1 bg-[#f9fafb]`,
    userHeader: tw`items-center border-b border-[#e5e7eb] bg-white p-8 shadow-sm`,
    avatar: tw`mb-4 h-20 w-20 items-center justify-center rounded-full`,
    avatarText: tw`text-[32px] font-bold text-white`,
    emailText: tw`mb-1 text-lg font-semibold text-[#111827]`,
    statsLabel: tw`text-sm text-[#4b5563]`,
    historySection: tw`flex-1 p-6`,
    sectionTitle: tw`mb-4 text-lg font-semibold text-[#111827]`,
    listContainer: tw`pb-8`,
    historyItem: tw`mb-2 flex-row items-center justify-between rounded-xl bg-white p-4 shadow-sm`,
    historyDate: tw`mb-0.5 text-sm text-[#4b5563]`,
    historyMode: tw`text-sm font-semibold text-[#4f46e5]`,
    scoreBadge: tw`rounded-full bg-[#f9fafb] px-3 py-1.5`,
    historyScore: tw`text-sm font-bold text-[#111827]`,
    emptyContainer: tw`mt-10 flex-1 items-center justify-center`,
    emptyText: tw`text-center text-base font-bold text-[#4b5563]`,
    emptySubtext: tw`mt-1 text-center text-sm text-[#9ca3af]`,
    logoutButton: tw`mt-4 rounded-lg bg-[#fee2e2] px-4 py-2`,
    logoutText: tw`text-sm font-bold text-[#ef4444]`,
    loadingContainer: tw`flex-1 items-center justify-center bg-[#f9fafb]`,
    loadingText: tw`mt-2.5 text-base text-[#4b5563]`,
};
