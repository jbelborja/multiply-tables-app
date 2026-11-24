// import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation/types';
import { ActivityIndicator, View, Text } from 'react-native';

import HomeScreen from './screens/HomeScreen';
import PracticaScreen from './screens/PracticaScreen';
import SummaryScreen from './screens/SummaryScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';

import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { theme } from './styles/theme';
import tw from 'twrnc';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<RootStackParamList>();

function CustomDrawerContent(props: any) {
  const { user, logout } = useAuth();
  const userInitial = user?.email ? user.email[0].toUpperCase() : '?';

  return (
    <DrawerContentScrollView {...props}>
      <View style={tw`mb-2.5 flex-row items-center border-b border-[#e5e7eb] bg-white p-5`}>
        <View style={tw`mr-4 h-[50px] w-[50px] items-center justify-center rounded-full bg-[#7c3aed]`}>
          <Text style={tw`text-xl font-bold text-white`}>
            {userInitial}
          </Text>
        </View>
        <View style={tw`flex-1`}>
          <Text style={tw`text-base font-bold text-[#111827]`} numberOfLines={1}>
            {user?.isAnonymous ? 'Usuario Anónimo' : user?.email}
          </Text>
          <Text style={tw`text-xs text-[#4b5563]`}>
            MultiTable Hero
          </Text>
        </View>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Cerrar Sesión"
        onPress={logout}
        labelStyle={tw`font-bold text-[#ef4444]`}
      />
    </DrawerContentScrollView>
  );
}

function AuthenticatedNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.white,
        },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Mi Perfil' }}
      />
      {/* Quiz and Summary stay in Stack but can be accessed from Home */}
    </Drawer.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-[#f9fafb]`}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerStyle: { backgroundColor: theme.colors.white },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: { fontWeight: 'bold' }
      }}>
        {user ? (
          <>
            <Stack.Screen
              name="Main"
              component={AuthenticatedNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Practica"
              component={PracticaScreen}
              options={{ title: 'Práctica de Tablas' }}
            />
            <Stack.Screen
              name="Summary"
              component={SummaryScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: 'Crear Cuenta' }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ title: 'Recuperar Contraseña' }}
            />
          </>
        )}
      </Stack.Navigator>
      {/* <StatusBar style="auto" /> */}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <AppNavigator />
      </SessionProvider>
    </AuthProvider>
  );
}
