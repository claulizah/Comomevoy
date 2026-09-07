import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../constants/theme';
import type { MainTabParamList } from '../types/navigation';
import CapturarTrayectoScreen from '../screens/CapturarTrayectoScreen';
import CuentaScreen from '../screens/CuentaScreen';
import HistorialScreen from '../screens/HistorialScreen';
import PresupuestoMensualScreen from '../screens/PresupuestoMensualScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  CapturarTrayecto: 'navigate',
  Historial: 'time',
  PresupuestoMensual: 'wallet',
  Cuenta: 'person-circle',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.backgroundElevated,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name as keyof MainTabParamList]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen
        name="CapturarTrayecto"
        component={CapturarTrayectoScreen}
        options={{ title: 'Comparar' }}
      />
      <Tab.Screen name="Historial" component={HistorialScreen} options={{ title: 'Historial' }} />
      <Tab.Screen
        name="PresupuestoMensual"
        component={PresupuestoMensualScreen}
        options={{ title: 'Presupuesto' }}
      />
      <Tab.Screen name="Cuenta" component={CuentaScreen} options={{ title: 'Cuenta' }} />
    </Tab.Navigator>
  );
}
