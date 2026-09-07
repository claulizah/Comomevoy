import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { placesService } from '../services/placesService';
import { colors, radii, spacing, typography } from '../constants/theme';
import type { Address } from '../types/comparador';
import type { PlaceSuggestion } from '../types/maps';

type AddressAutocompleteInputProps = {
  label: string;
  placeholder: string;
  value: Address | null;
  onChange: (address: Address | null) => void;
};

export default function AddressAutocompleteInput({ label, placeholder, value, onChange }: AddressAutocompleteInputProps) {
  const [texto, setTexto] = useState(value?.descripcion ?? '');
  const [sugerencias, setSugerencias] = useState<PlaceSuggestion[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const textoDebounced = useDebouncedValue(texto, 250);

  useEffect(() => {
    let cancelado = false;

    async function buscar() {
      if (!mostrarSugerencias || textoDebounced.trim().length < 2) {
        setSugerencias([]);
        return;
      }
      setBuscando(true);
      const resultados = await placesService.autocomplete(textoDebounced);
      if (!cancelado) {
        setSugerencias(resultados);
        setBuscando(false);
      }
    }

    buscar();
    return () => {
      cancelado = true;
    };
  }, [textoDebounced, mostrarSugerencias]);

  function handleChangeText(nuevoTexto: string) {
    setTexto(nuevoTexto);
    setMostrarSugerencias(true);
    if (value) onChange(null);
  }

  function handleSeleccionar(sugerencia: PlaceSuggestion) {
    setTexto(sugerencia.descripcionPrincipal);
    setMostrarSugerencias(false);
    setSugerencias([]);
    onChange({
      descripcion: sugerencia.descripcionPrincipal,
      descripcionSecundaria: sugerencia.descripcionSecundaria,
      placeId: sugerencia.placeId,
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={texto}
        onChangeText={handleChangeText}
        onFocus={() => setMostrarSugerencias(true)}
      />
      {mostrarSugerencias && (buscando || sugerencias.length > 0) && (
        <View style={styles.dropdown}>
          {buscando ? (
            <ActivityIndicator color={colors.primary} style={styles.loading} />
          ) : (
            sugerencias.map((sugerencia) => (
              <TouchableOpacity
                key={sugerencia.placeId}
                style={styles.sugerencia}
                onPress={() => handleSeleccionar(sugerencia)}
              >
                <Text style={styles.sugerenciaPrincipal}>{sugerencia.descripcionPrincipal}</Text>
                {sugerencia.descripcionSecundaria ? (
                  <Text style={styles.sugerenciaSecundaria}>{sugerencia.descripcionSecundaria}</Text>
                ) : null}
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    zIndex: 1,
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
  dropdown: {
    backgroundColor: colors.backgroundElevatedAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  loading: {
    paddingVertical: spacing.md,
  },
  sugerencia: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sugerenciaPrincipal: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
  },
  sugerenciaSecundaria: {
    color: colors.textMuted,
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
});
