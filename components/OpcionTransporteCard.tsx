import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { TRANSPORT_MODE_META } from '../constants/transportModes';
import { colors, radii, spacing, typography } from '../constants/theme';
import { formatCO2, formatCurrencyMXN, formatDuration } from '../services/formatters';
import type { OpcionTransporte } from '../types/comparador';

type OpcionTransporteCardProps = {
  opcion: OpcionTransporte;
};

export default function OpcionTransporteCard({ opcion }: OpcionTransporteCardProps) {
  const meta = TRANSPORT_MODE_META[opcion.modo];

  if (!opcion.disponible) {
    return (
      <View style={[styles.card, styles.cardNoDisponible]}>
        <Ionicons name={meta.icono} size={22} color={colors.textMuted} />
        <View style={styles.info}>
          <Text style={styles.nombreNoDisponible}>{meta.nombre}</Text>
          {opcion.motivoNoDisponible ? <Text style={styles.motivo}>{opcion.motivoNoDisponible}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, opcion.esRecomendada && styles.cardRecomendada]}>
      <Ionicons name={meta.icono} size={24} color={opcion.esRecomendada ? colors.secondary : colors.primary} />
      <View style={styles.info}>
        <View style={styles.encabezado}>
          <Text style={styles.nombre}>
            {meta.nombre}
            {opcion.esEstimado ? <Text style={styles.estimado}> (estimado)</Text> : null}
          </Text>
          {opcion.esRecomendada ? <Text style={styles.badge}>Más barata</Text> : null}
        </View>
        <Text style={styles.costoTotal}>{formatCurrencyMXN(opcion.costoTotal)}</Text>
        <View style={styles.detalles}>
          <Text style={styles.detalle}>{formatCurrencyMXN(opcion.costoPorPersona)} / persona</Text>
          <Text style={styles.detalle}>{formatDuration(opcion.tiempoEstimadoMin)}</Text>
          <Text style={styles.detalle}>{formatCO2(opcion.co2Kg)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  cardRecomendada: {
    borderColor: colors.secondary,
    backgroundColor: colors.backgroundElevatedAlt,
  },
  cardNoDisponible: {
    opacity: 0.5,
  },
  info: {
    flex: 1,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nombre: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
  },
  estimado: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular as any,
  },
  nombreNoDisponible: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium as any,
  },
  badge: {
    color: colors.secondaryContrastText,
    backgroundColor: colors.secondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold as any,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  costoTotal: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
    marginTop: spacing.xs,
  },
  detalles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  detalle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  motivo: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
});
