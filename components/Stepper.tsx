import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing, typography } from '../constants/theme';

type StepperProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
};

export default function Stepper({ label, value, min = 1, max = 20, onChange }: StepperProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controles}>
        <TouchableOpacity
          style={styles.boton}
          disabled={value <= min}
          onPress={() => onChange(Math.max(min, value - 1))}
        >
          <Text style={[styles.botonTexto, value <= min && styles.botonTextoDeshabilitado]}>−</Text>
        </TouchableOpacity>
        <Text style={styles.valor}>{value}</Text>
        <TouchableOpacity
          style={styles.boton}
          disabled={value >= max}
          onPress={() => onChange(Math.min(max, value + 1))}
        >
          <Text style={[styles.botonTexto, value >= max && styles.botonTextoDeshabilitado]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  controles: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    alignSelf: 'flex-start',
  },
  boton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  botonTexto: {
    color: colors.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
  },
  botonTextoDeshabilitado: {
    color: colors.textMuted,
  },
  valor: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    minWidth: 32,
    textAlign: 'center',
  },
});
