import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OpcionTransporteCard from '../components/OpcionTransporteCard';
import { colors, radii, spacing, typography } from '../constants/theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Resultado'>;

export default function ResultadoScreen({ route }: Props) {
  const { resultado } = route.params;
  const disponibles = resultado.opciones.filter((o) => o.disponible);
  const noDisponibles = resultado.opciones.filter((o) => !o.disponible);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {resultado.mensajeDestacado ? (
          <View style={styles.banner}>
            <Text style={styles.bannerTexto}>{resultado.mensajeDestacado}</Text>
          </View>
        ) : null}

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
