import React, { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VehicleProfileForm from '../components/VehicleProfileForm';
import { colors, radii, spacing, typography } from '../constants/theme';
import { useCitySettings } from '../hooks/useCitySettings';
import { useVehicleProfile } from '../hooks/useVehicleProfile';
import { defaultCitySettings, defaultVehicleProfile } from '../services/ratesService';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  const { vehicleProfile, loadingVehicleProfile, saveVehicleProfile } = useVehicleProfile();
  const { citySettings, loadingCitySettings, saveCitySettings } = useCitySettings();

  const [perfil, setPerfil] = useState(defaultVehicleProfile);
  const [ciudad, setCiudad] = useState(defaultCitySettings.ciudad);
  const [guardando, setGuardando] = useState(false);

  const cargando = loadingVehicleProfile || loadingCitySettings;
  const yaConfigurado = !!vehicleProfile && !!citySettings;

  useEffect(() => {
    if (!cargando && yaConfigurado) {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  }, [cargando, yaConfigurado, navigation]);

  async function handleComenzar() {
    setGuardando(true);
    await Promise.all([
      saveVehicleProfile(perfil),
      saveCitySettings({ ...defaultCitySettings, ciudad: ciudad.trim() || defaultCitySettings.ciudad }),
    ]);
    setGuardando(false);
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }

  if (cargando || yaConfigurado) {
    return (
      <SafeAreaView style={styles.containerCentrado}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}>¿CómoMeVoy?</Text>
          <Text style={styles.subtitulo}>
            Cuéntanos de tu auto y tu ciudad para que cada comparación use tus propios números.
          </Text>

          <Text style={styles.seccionTitulo}>Tu auto</Text>
          <VehicleProfileForm value={perfil} onChange={setPerfil} />

          <Text style={styles.seccionTitulo}>Tu ciudad</Text>
          <View style={styles.campo}>
            <Text style={styles.label}>Ciudad</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Ciudad de México"
              placeholderTextColor={colors.textMuted}
              value={ciudad}
              onChangeText={setCiudad}
            />
          </View>

          <TouchableOpacity style={[styles.boton, guardando && styles.botonDeshabilitado]} onPress={handleComenzar} disabled={guardando}>
            <Text style={styles.botonTexto}>{guardando ? 'Guardando…' : 'Comenzar'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerCentrado: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: spacing.lg,
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold as any,
  },
  subtitulo: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  seccionTitulo: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold as any,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  campo: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
  },
  boton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonTexto: {
    color: colors.primaryContrastText,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold as any,
  },
});
