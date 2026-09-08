import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radii, spacing, typography } from '../constants/theme';
import type { VehicleProfile } from '../types/models';

type VehicleProfileFormProps = {
  value: VehicleProfile;
  onChange: (value: VehicleProfile) => void;
};

type CampoNumerico = Exclude<keyof VehicleProfile, 'id'>;

const CAMPOS: Array<{ campo: CampoNumerico; label: string; placeholder: string }> = [
  { campo: 'rendimientoKmPorLitro', label: 'Rendimiento', placeholder: 'km por litro' },
  { campo: 'precioGasolinaPorLitro', label: 'Precio de la gasolina', placeholder: 'MXN por litro' },
  { campo: 'seguroMensual', label: 'Seguro', placeholder: 'MXN al mes' },
  { campo: 'mantenimientoMensual', label: 'Mantenimiento', placeholder: 'MXN al mes' },
  { campo: 'depreciacionPorKm', label: 'Depreciación', placeholder: 'MXN por km' },
  { campo: 'kmMensualesReferencia', label: 'Kilómetros que manejas al mes', placeholder: 'km al mes (referencia)' },
];

/** Formulario reusable de VehicleProfile/MotoProfile — usado en Onboarding y PerfilAuto. */
export default function VehicleProfileForm({ value, onChange }: VehicleProfileFormProps) {
  const [textos, setTextos] = useState<Record<CampoNumerico, string>>(() => {
    const inicial = {} as Record<CampoNumerico, string>;
    for (const { campo } of CAMPOS) {
      inicial[campo] = String(value[campo]);
    }
    return inicial;
  });

  function handleChangeTexto(campo: CampoNumerico, texto: string) {
    setTextos((prev) => ({ ...prev, [campo]: texto }));
    const numero = parseFloat(texto.replace(',', '.'));
    if (Number.isFinite(numero) && numero >= 0) {
      onChange({ ...value, [campo]: numero });
    }
  }

  return (
    <View>
      {CAMPOS.map(({ campo, label, placeholder }) => (
        <View key={campo} style={styles.campo}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={textos[campo]}
            onChangeText={(texto) => handleChangeTexto(campo, texto)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
});
