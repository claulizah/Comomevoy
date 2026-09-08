import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../constants/theme';
import { useCitySettings } from '../hooks/useCitySettings';
import { useComparisonHistory } from '../hooks/useComparisonHistory';
import { useMonthlyBudget } from '../hooks/useMonthlyBudget';
import { evaluarPresupuesto } from '../services/historyStatsService';
import { formatCurrencyMXN } from '../services/formatters';

function mesActualISO(): string {
  const ahora = new Date();
  return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
}

export default function PresupuestoMensualScreen() {
  const { monthlyBudget, loadingMonthlyBudget, saveMonthlyBudget } = useMonthlyBudget();
  const { citySettings } = useCitySettings();
  const { history } = useComparisonHistory();

  const [montoTexto, setMontoTexto] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!loadingMonthlyBudget && montoTexto === null) {
      setMontoTexto(monthlyBudget ? String(monthlyBudget.monto) : '');
    }
  }, [loadingMonthlyBudget, monthlyBudget, montoTexto]);

  const monto = monthlyBudget?.monto ?? 0;
  const evaluacion = useMemo(() => evaluarPresupuesto(history, monto), [history, monto]);
  const { gastoDelMes, restante, rebasado, porcentaje } = evaluacion;
  const hayPresupuesto = monto > 0;

  async function handleGuardar() {
    if (montoTexto === null) return;
    const numero = parseFloat(montoTexto.replace(',', '.'));
    if (!Number.isFinite(numero) || numero < 0) return;
    setGuardando(true);
    await saveMonthlyBudget({ monto: numero, mes: mesActualISO() });
    setGuardando(false);
    setGuardado(true);
  }

  if (loadingMonthlyBudget || montoTexto === null) {
    return (
      <SafeAreaView style={styles.containerCentrado}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}>Presupuesto mensual</Text>
          {citySettings ? <Text style={styles.subtitulo}>Para {citySettings.ciudad}</Text> : null}

          <View style={styles.campo}>
            <Text style={styles.label}>Monto mensual (MXN)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 2000"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={montoTexto}
              onChangeText={(texto) => {
                setMontoTexto(texto);
                setGuardado(false);
              }}
            />
          </View>

          {guardado ? <Text style={styles.confirmacion}>Guardado.</Text> : null}

          <TouchableOpacity style={[styles.boton, guardando && styles.botonDeshabilitado]} onPress={handleGuardar} disabled={guardando}>
            <Text style={styles.botonTexto}>{guardando ? 'Guardando…' : 'Guardar'}</Text>
          </TouchableOpacity>

          {hayPresupuesto ? (
            <View style={styles.resumen}>
              <Text style={styles.resumenLabel}>Gastado este mes</Text>
              <Text style={styles.resumenValor}>
                {formatCurrencyMXN(gastoDelMes)} <Text style={styles.resumenValorMuted}>de {formatCurrencyMXN(monto)}</Text>
              </Text>

              <View style={styles.barraFondo}>
                <View style={[styles.barraRelleno, { width: `${porcentaje}%` }, rebasado && styles.barraRellenoRebasado]} />
              </View>

              {rebasado ? (
                <View style={styles.alerta}>
                  <Text style={styles.alertaTexto}>Te pasaste del presupuesto por {formatCurrencyMXN(-restante)}.</Text>
                </View>
              ) : (
                <Text style={styles.notaOk}>Vas bien — te quedan {formatCurrencyMXN(restante)} este mes.</Text>
              )}
            </View>
          ) : (
            <Text style={styles.nota}>Define un monto para ver cuánto llevas gastado este mes.</Text>
          )}
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
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonTexto: {
    color: colors.primaryContrastText,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold as any,
  },
  resumen: {
    marginTop: spacing.xl,
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  resumenLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },
  resumenValor: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
    marginTop: spacing.xs,
  },
  resumenValorMuted: {
    color: colors.textMuted,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular as any,
  },
  barraFondo: {
    height: 10,
    borderRadius: radii.full,
    backgroundColor: colors.backgroundElevatedAlt,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  barraRelleno: {
    height: '100%',
    borderRadius: radii.full,
    backgroundColor: colors.secondary,
  },
  barraRellenoRebasado: {
    backgroundColor: colors.error,
  },
  alerta: {
    backgroundColor: colors.error,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  alertaTexto: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold as any,
  },
  notaOk: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.md,
  },
  nota: {
    color: colors.textMuted,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});
