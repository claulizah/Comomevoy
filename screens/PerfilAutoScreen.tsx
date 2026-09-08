import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import VehicleProfileForm from '../components/VehicleProfileForm';
import { colors, radii, spacing, typography } from '../constants/theme';
import { useVehicleProfile } from '../hooks/useVehicleProfile';
import { defaultVehicleProfile } from '../services/ratesService';
import type { VehicleProfile } from '../types/models';

export default function PerfilAutoScreen() {
  const { vehicleProfile, loadingVehicleProfile, saveVehicleProfile } = useVehicleProfile();
  const [perfil, setPerfil] = useState<VehicleProfile | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    if (!loadingVehicleProfile && perfil === null) {
      setPerfil(vehicleProfile ?? defaultVehicleProfile);
    }
  }, [loadingVehicleProfile, vehicleProfile, perfil]);

  function handleChange(nuevoPerfil: VehicleProfile) {
    setPerfil(nuevoPerfil);
    setGuardado(false);
  }

  async function handleGuardar() {
    if (!perfil) return;
    setGuardando(true);
    await saveVehicleProfile(perfil);
    setGuardando(false);
    setGuardado(true);
  }

  if (loadingVehicleProfile || perfil === null) {
    return (
      <SafeAreaView style={styles.containerCentrado}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Perfil de auto</Text>
        <Text style={styles.subtitulo}>Estos números se usan para calcular el costo de "tu auto" en cada comparación.</Text>

        <VehicleProfileForm value={perfil} onChange={handleChange} />

        {guardado ? <Text style={styles.confirmacion}>Guardado.</Text> : null}

        <TouchableOpacity style={[styles.boton, guardando && styles.botonDeshabilitado]} onPress={handleGuardar} disabled={guardando}>
          <Text style={styles.botonTexto}>{guardando ? 'Guardando…' : 'Guardar'}</Text>
        </TouchableOpacity>
      </ScrollView>
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
  confirmacion: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  boton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
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
