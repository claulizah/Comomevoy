import React, { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TRANSPORT_MODE_META } from '../constants/transportModes';
import { colors, radii, spacing, typography } from '../constants/theme';
import { useComparisonHistory } from '../hooks/useComparisonHistory';
import { calcularAhorro, calcularEstadisticas } from '../services/historyStatsService';
import { formatCurrencyMXN } from '../services/formatters';
import type { ComparisonHistory } from '../types/models';
import type { TransportMode } from '../types/comparador';

function formatFecha(fechaISO: string): string {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' }).format(new Date(fechaISO));
}

function nombreRuta(entry: ComparisonHistory): string {
  if (entry.origen && entry.destino) return `${entry.origen} → ${entry.destino}`;
  return `${Math.round(entry.distanciaKm)} km`;
}

function nombreOpcion(modo: string): string {
  return TRANSPORT_MODE_META[modo as TransportMode]?.nombre ?? modo;
}

export default function HistorialScreen() {
  const { history, removeHistoryEntry } = useComparisonHistory();
  const estadisticas = useMemo(() => calcularEstadisticas(history), [history]);
  const historialOrdenado = useMemo(
    () => [...history].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [history]
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={historialOrdenado}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View>
            <Text style={styles.titulo}>Historial</Text>
            <View style={styles.tarjetas}>
              <View style={styles.tarjeta}>
                <Text style={styles.tarjetaLabel}>Ahorro este mes</Text>
                <Text style={styles.tarjetaValor}>{formatCurrencyMXN(estadisticas.ahorroDelMes)}</Text>
              </View>
              <View style={styles.tarjeta}>
                <Text style={styles.tarjetaLabel}>Proyección anual</Text>
                <Text style={styles.tarjetaValor}>{formatCurrencyMXN(estadisticas.proyeccionAnual)}</Text>
              </View>
            </View>
            <Text style={styles.nota}>
              Proyección estimada: promedio de ahorro por comparación × frecuencia de uso reciente.
            </Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.vacio}>Todavía no has comparado ningún trayecto.</Text>}
        renderItem={({ item }) => {
          const ahorro = calcularAhorro(item);
          return (
            <View style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemRuta}>{nombreRuta(item)}</Text>
                <Text style={styles.itemDetalle}>
                  {formatFecha(item.fecha)} · {nombreOpcion(item.opcionGanadora)}
                  {ahorro > 0 ? ` · ahorraste ${formatCurrencyMXN(ahorro)}` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeHistoryEntry(item.id)}>
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  lista: {
    padding: spacing.lg,
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold as any,
    marginBottom: spacing.lg,
  },
  tarjetas: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tarjeta: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  tarjetaLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
  },
  tarjetaValor: {
    color: colors.secondary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
    marginTop: spacing.xs,
  },
  nota: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  vacio: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemRuta: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
  },
  itemDetalle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
});
