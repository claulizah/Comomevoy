import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TRANSPORT_MODE_META } from '../constants/transportModes';
import { colors, radii, spacing, typography } from '../constants/theme';
import { formatCurrencyMXN } from '../services/formatters';
import { formatearDireccion } from '../services/historyService';
import type { ResultadoComparacion } from '../types/comparador';

const MAX_OPCIONES_EN_TARJETA = 4;

type ResultadoShareCardProps = {
  resultado: ResultadoComparacion;
};

function nombreRuta(resultado: ResultadoComparacion): string {
  const origen = formatearDireccion(resultado.input.origen);
  const destino = formatearDireccion(resultado.input.destino);
  if (origen && destino) return `${origen} → ${destino}`;
  return `${Math.round(resultado.input.distanciaKm)} km`;
}

/** Tarjeta compacta y siempre-visible (sin scroll) pensada para capturarse como imagen. */
export default function ResultadoShareCard({ resultado }: ResultadoShareCardProps) {
  const opciones = resultado.opciones
    .filter((o) => o.disponible)
    .sort((a, b) => a.costoPorPersona - b.costoPorPersona)
    .slice(0, MAX_OPCIONES_EN_TARJETA);

  return (
    <View style={styles.card}>
      <Text style={styles.marca}>¿CómoMeVoy?</Text>
      <Text style={styles.ruta}>{nombreRuta(resultado)}</Text>

      {resultado.mensajeDestacado ? <Text style={styles.mensaje}>{resultado.mensajeDestacado}</Text> : null}

      {opciones.map((opcion) => (
        <View key={opcion.modo} style={styles.fila}>
          <Text style={[styles.filaNombre, opcion.esRecomendada && styles.filaNombreDestacado]}>
            {TRANSPORT_MODE_META[opcion.modo].nombre}
          </Text>
          <Text style={[styles.filaCosto, opcion.esRecomendada && styles.filaCostoDestacado]}>
            {formatCurrencyMXN(opcion.costoTotal)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  marca: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold as any,
    marginBottom: spacing.sm,
  },
  ruta: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
  },
  mensaje: {
    color: colors.secondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    borderTopColor: colors.borderSubtle,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  filaNombre: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  filaNombreDestacado: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold as any,
  },
  filaCosto: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  filaCostoDestacado: {
    color: colors.secondary,
    fontWeight: typography.fontWeight.bold as any,
  },
});
