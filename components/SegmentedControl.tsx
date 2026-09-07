import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing, typography } from '../constants/theme';

type Segment<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function SegmentedControl<T extends string>({ segments, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View style={styles.container}>
      {segments.map((segment) => {
        const activo = segment.value === value;
        return (
          <TouchableOpacity
            key={segment.value}
            style={[styles.segmento, activo && styles.segmentoActivo]}
            onPress={() => onChange(segment.value)}
          >
            <Text style={[styles.texto, activo && styles.textoActivo]}>{segment.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundElevated,
    borderRadius: radii.md,
    padding: spacing.xs / 2,
    borderColor: colors.border,
    borderWidth: 1,
  },
  segmento: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  segmentoActivo: {
    backgroundColor: colors.primary,
  },
  texto: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
  },
  textoActivo: {
    color: colors.primaryContrastText,
  },
});
