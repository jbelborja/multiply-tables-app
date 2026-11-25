import React from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSession, PracticaResult } from '../context/SessionContext';
import { theme } from '../styles/theme';
import tw from 'twrnc';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { history, loadingHistory, historyError } = useSession();
    const { width } = useWindowDimensions();
    const isWide = width >= 760;

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
                <View style={styles.historyDetails}>
                    <View style={styles.historyTitleRow}>
                        <Text style={styles.historyMode}>
                            {item.mode === 'typed' ? '✍️ Escribir' : '🎯 Elegir'}
                        </Text>
                        <Text style={styles.tableTag}>{item.tables.length === 1 ? `Tabla ${item.tables[0]}` : `${item.tables.length} tablas`}</Text>
                    </View>
                    <Text style={styles.historyDate}>{date.toLocaleDateString()} - {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View style={styles.scoreBadge}>
                    <Text style={styles.historyScore}>
                        {item.score}/{item.total}
                    </Text>
                    <Text style={styles.scoreCaption}>aciertos</Text>
                </View>
            </View>
        );
    };

    const userInitial = user?.email ? user.email[0].toUpperCase() : '?';

    return (
        <View style={styles.container}>
            <View style={styles.page}>
                <View style={[styles.userHeader, isWide && styles.userHeaderWide]}>
                    <View style={styles.userInfo}>
                        <View style={[styles.avatar, { backgroundColor: theme.colors.secondary }]}>
                            <Text style={styles.avatarText}>{userInitial}</Text>
                        </View>
                        <View style={styles.userCopy}>
                            <Text style={styles.eyebrow}>TU ESPACIO DE HÉROE</Text>
                            <Text style={styles.emailText} numberOfLines={1}>
                                {user?.isAnonymous ? 'Jugador invitado' : user?.email}
                            </Text>
                            <Text style={styles.statsLabel}>🌟 {history.length} {history.length === 1 ? 'misión completada' : 'misiones completadas'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
                        <Text style={styles.logoutText}>Cerrar sesión</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.historySection}>
                    <View style={styles.sectionHeading}>
                        <View>
                            <Text style={styles.sectionTitle}>Tu historial</Text>
                            <Text style={styles.sectionSubtitle}>Mira todo lo que has conseguido</Text>
                        </View>
                        <Text style={styles.trophy}>🏆</Text>
                    </View>

                    {historyError ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{historyError}</Text>
                        </View>
                    ) : history.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyEmoji}>🗺️</Text>
                            <Text style={styles.emptyText}>¡Tu aventura empieza aquí!</Text>
                            <Text style={styles.emptySubtext}>Completa tu primera práctica y aparecerá en este historial.</Text>
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
        </View>
    );
}

const styles = {
    container: tw`flex-1 bg-[#f5f8ff]`,
    page: [tw`w-full flex-1 self-center`, { maxWidth: 1050 }],
    userHeader: tw`mb-4 flex-row items-center justify-between border-b border-[#e7ecf6] bg-white px-5 py-5`,
    userHeaderWide: tw`mt-5 rounded-3xl border px-7 py-6`,
    userInfo: tw`min-w-0 flex-1 flex-row items-center`,
    userCopy: tw`min-w-0 flex-1`,
    avatar: tw`mr-4 h-14 w-14 items-center justify-center rounded-2xl`,
    avatarText: tw`text-[32px] font-bold text-white`,
    eyebrow: tw`mb-1 text-[10px] font-black tracking-widest text-[#7046d8]`,
    emailText: tw`text-base font-extrabold text-[#172554]`,
    statsLabel: tw`mt-1 text-sm font-semibold text-[#71809d]`,
    historySection: tw`flex-1 px-4 pb-4 pt-3`,
    sectionHeading: tw`mb-4 flex-row items-center justify-between`,
    sectionTitle: tw`text-xl font-black text-[#172554]`,
    sectionSubtitle: tw`mt-1 text-sm text-[#73809a]`,
    trophy: tw`text-3xl`,
    listContainer: tw`pb-6`,
    historyItem: tw`mb-3 flex-row items-center justify-between rounded-2xl border border-[#e7ecf6] bg-white p-4`,
    historyDetails: tw`min-w-0 flex-1 pr-3`,
    historyTitleRow: tw`mb-1 flex-row flex-wrap items-center`,
    historyMode: tw`mr-2 text-sm font-extrabold text-[#25365d]`,
    tableTag: tw`rounded-full bg-[#f0ecff] px-2 py-1 text-xs font-bold text-[#7046d8]`,
    historyDate: tw`text-xs text-[#8792a8]`,
    scoreBadge: tw`min-w-[66px] items-center rounded-2xl bg-[#eaf9f2] px-3 py-2`,
    historyScore: tw`text-lg font-black text-[#16835e]`,
    scoreCaption: tw`text-[10px] font-bold text-[#398b70]`,
    emptyContainer: tw`mt-4 flex-1 items-center justify-center rounded-3xl border border-[#e7ecf6] bg-white px-6 py-10`,
    emptyEmoji: tw`mb-3 text-5xl`,
    emptyText: tw`text-center text-base font-extrabold text-[#52617f]`,
    emptySubtext: tw`mt-2 max-w-[360px] text-center text-sm leading-5 text-[#8792a8]`,
    logoutButton: tw`ml-2 rounded-xl bg-[#fff0f0] px-3 py-2.5`,
    logoutText: tw`text-xs font-extrabold text-[#c33c4a]`,
    loadingContainer: tw`flex-1 items-center justify-center bg-[#f5f8ff]`,
    loadingText: tw`mt-2.5 text-base text-[#52617f]`,
};
