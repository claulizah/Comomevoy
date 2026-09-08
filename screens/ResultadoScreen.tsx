import React, { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OpcionTransporteCard from '../components/OpcionTransporteCard';
import { colors, radii, spacing, typography } from '../constants/theme';
import { formatearRutaDescripcion, guardarComoRutaFrecuente } from '../services/frequentRouteService';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Resultado'>;

export default function ResultadoScreen({ route }: Props) {
  const { resultado, sugerenciaRutaFrecuente } = route.params;
  const disponibles = resultado.opciones.filter((o) => o.disponible);
  const noDisponibles = resultado.opciones.filter((o) => !o.disponible);
  const [rutaGuardada, setRutaGuardada] = useState(false);

  async function handleGuardarRutaFrecuente() {
    if (!sugerenciaRutaFrecuente) return;
    await guardarComoRutaFrecuente(sugerenciaRutaFrecuente);
    setRutaGuardada(true);
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {resultado.mensajeDestacado ? (
          <View style={styles.banner}>
            <Text style={styles.bannerTexto}>{resultado.mensajeDestacado}</Text>
          </View>
        ) : null}

        {sugerenciaRutaFrecuente && !rutaGuardada ? (
          <View style={styles.bannerRutaFrecuente}>
            <Text style={styles.bannerRutaFrecuenteTexto}>
              Llevas {sugerenciaRutaFrecuente.repeticiones} veces {formatearRutaDescripcion(sugerenciaRutaFrecuente)} esta semana.
            </Text>
            <TouchableOpacity style={styles.bannerRutaFrecuenteBoton} onPress={handleGuardarRutaFrecuente}>
              <Text style={styles.bannerRutaFrecuenteBotonTexto}>Guardar como ruta frecuente</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {rutaGuardada ? <Text style={styles.confirmacion}>Guardada como ruta frecuente.</Text> : null}

        <Text style={styles.seccionTitulo}>Opciones disponibles</Text>
        {disponibles.map((opcion) => (
          <OpcionTransporteCard key={opcion.modo} opcion={opcion} />
        ))}

        {noDisponibles.length > 0 && (
          <>
            <Text style={styles.seccionTitulo}>No disponibles para este trayecto</Text>
            {noDisponibles.map((opcion) => (
              <OpcionTransporteCard key={opcion.modo} opcion={opcion} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.lg,
  },
  banner: {
    backgroundColor: colors.secondary,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bannerTexto: {
    color: colors.secondaryContrastText,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
  },
  bannerRutaFrecuente: {
    backgroundColor: colors.backgroundElevatedAlt,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  bannerRutaFrecuenteTexto: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  bannerRutaFrecuenteBoton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  bannerRutaFrecuenteBotonTexto: {
    color: colors.primaryContrastText,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold as any,
  },
  confirmacion: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
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
});
