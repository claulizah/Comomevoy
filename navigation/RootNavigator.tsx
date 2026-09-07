import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/theme';
import type { RootStackParamList } from '../types/navigation';
import OnboardingScreen from '../screens/OnboardingScreen';
import ResultadoScreen from '../screens/ResultadoScreen';
import PerfilAutoScreen from '../screens/PerfilAutoScreen';
import DireccionesFavoritasScreen from '../screens/DireccionesFavoritasScreen';
import SuscripcionScreen from '../screens/SuscripcionScreen';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerStyle: { backgroundColor: colors.backgroundElevated },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Resultado" component={ResultadoScreen} options={{ title: 'Resultado' }} />
      <Stack.Screen name="PerfilAuto" component={PerfilAutoScreen} options={{ title: 'Perfil de auto' }} />
      <Stack.Screen
        name="DireccionesFavoritas"
        component={DireccionesFavoritasScreen}
        options={{ title: 'Direcciones favoritas' }}
      />
      <Stack.Screen name="Suscripcion" component={SuscripcionScreen} options={{ title: 'Suscripción' }} />
    </Stack.Navigator>
  );
}
