import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddressAutocompleteInput from '../components/AddressAutocompleteInput';
import { colors, radii, spacing, typography } from '../constants/theme';
import { useFavoriteAddresses } from '../hooks/useFavoriteAddresses';
import { generateId } from '../services/id';
import type { Address } from '../types/comparador';
import type { FavoriteAddress } from '../types/models';

type FormState = { id: string | null; etiqueta: string; direccion: Address | null };

const FORM_VACIO: FormState = { id: null, etiqueta: '', direccion: null };

export default function DireccionesFavoritasScreen() {
  const { favoriteAddresses, addFavoriteAddress, updateFavoriteAddress, removeFavoriteAddress } = useFavoriteAddresses();
  const [form, setForm] = useState<FormState | null>(null);

  function handleNueva() {
    setForm(FORM_VACIO);
  }

  function handleEditar(favorito: FavoriteAddress) {
    setForm({
      id: favorito.id,
      etiqueta: favorito.etiqueta,
      direccion: favorito.placeId ? { descripcion: favorito.direccion, placeId: favorito.placeId, lat: favorito.lat, lng: favorito.lng } : null,
    });
  }

  async function handleGuardar() {
    if (!form || !form.etiqueta.trim() || !form.direccion) return;

    const datos: FavoriteAddress = {
      id: form.id ?? generateId(),
      etiqueta: form.etiqueta.trim(),
      direccion: form.direccion.descripcion,
      placeId: form.direccion.placeId,
      lat: form.direccion.lat,
      lng: form.direccion.lng,
    };

    if (form.id) {
      await updateFavoriteAddress(form.id, datos);
    } else {
      await addFavoriteAddress(datos);
    }
    setForm(null);
  }

  if (form) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.formulario}>
          <Text style={styles.titulo}>{form.id ? 'Editar dirección' : 'Nueva dirección'}</Text>

          <View style={styles.campo}>
            <Text style={styles.label}>Etiqueta</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Casa, Trabajo"
              placeholderTextColor={colors.textMuted}
              value={form.etiqueta}
              onChangeText={(etiqueta) => setForm((prev) => (prev ? { ...prev, etiqueta } : prev))}
            />
          </View>

          <AddressAutocompleteInput
            label="Dirección"
            placeholder="Busca una dirección"
            value={form.direccion}
            onChange={(direccion) => setForm((prev) => (prev ? { ...prev, direccion } : prev))}
          />

          <View style={styles.filaBotones}>
            <TouchableOpacity style={styles.botonSecundario} onPress={() => setForm(null)}>
              <Text style={styles.botonSecundarioTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.boton, (!form.etiqueta.trim() || !form.direccion) && styles.botonDeshabilitado]}
              onPress={handleGuardar}
              disabled={!form.etiqueta.trim() || !form.direccion}
            >
              <Text style={styles.botonTexto}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={favoriteAddresses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View style={styles.encabezado}>
            <Text style={styles.titulo}>Direcciones favoritas</Text>
            <TouchableOpacity style={styles.botonAgregar} onPress={handleNueva}>
              <Ionicons name="add" size={20} color={colors.primaryContrastText} />
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={<Text style={styles.vacio}>Todavía no tienes direcciones guardadas.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity style={styles.itemInfo} onPress={() => handleEditar(item)}>
              <Text style={styles.itemEtiqueta}>{item.etiqueta}</Text>
              <Text style={styles.itemDireccion}>{item.direccion}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeFavoriteAddress(item.id)}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        )}
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
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold as any,
  },
  botonAgregar: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
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
  itemEtiqueta: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
  },
  itemDireccion: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  formulario: {
    padding: spacing.lg,
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
  filaBotones: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  boton: {
    flex: 1,
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
  botonSecundario: {
    flex: 1,
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  botonSecundarioTexto: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium as any,
  },
});
