import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSession, PracticaResult } from '../context/SessionContext';
import { theme } from '../styles/theme';

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    userHeader: {
        backgroundColor: theme.colors.white,
        padding: theme.spacing.xl,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        ...theme.shadows.sm,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.white,
    },
    emailText: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: 4,
    },
    statsLabel: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
    },
    historySection: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    sectionTitle: {
        ...theme.typography.h3,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    listContainer: {
        paddingBottom: theme.spacing.xl,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderRadius: theme.roundness.lg,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    historyDate: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginBottom: 2,
    },
    historyMode: {
        ...theme.typography.body,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    scoreBadge: {
        backgroundColor: theme.colors.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: theme.roundness.full,
    },
    historyScore: {
        fontWeight: 'bold',
        fontSize: 14,
        color: theme.colors.text,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        ...theme.typography.body,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
    emptySubtext: {
        ...theme.typography.caption,
        color: theme.colors.textLight,
        textAlign: 'center',
        marginTop: 4,
    },
    logoutButton: {
        marginTop: theme.spacing.md,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.roundness.md,
        backgroundColor: '#FEE2E2',
    },
    logoutText: {
        color: theme.colors.error,
        fontWeight: 'bold',
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    loadingText: {
        marginTop: 10,
        color: theme.colors.textSecondary,
        ...theme.typography.body,
    },
});
