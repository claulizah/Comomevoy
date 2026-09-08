import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddressAutocompleteInput from '../components/AddressAutocompleteInput';
import SegmentedControl from '../components/SegmentedControl';
import Stepper from '../components/Stepper';
import { colors, radii, spacing, typography } from '../constants/theme';
import { useComparador } from '../hooks/useComparador';
import { useFavoriteAddresses } from '../hooks/useFavoriteAddresses';
import type { RootStackParamList } from '../types/navigation';
import type { FavoriteAddress } from '../types/models';

export default function CapturarTrayectoScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const comparador = useComparador();
  const { favoriteAddresses } = useFavoriteAddresses();

  async function handleComparar() {
    const resultadoConSugerencia = await comparador.calcular();
    if (resultadoConSugerencia) {
      navigation.navigate('Resultado', resultadoConSugerencia);
    }
  }

  // Si el origen ya está lleno, el acceso rápido llena el destino; si no, llena el origen.
  function handleFavoritoPress(favorito: FavoriteAddress) {
    if (!favorito.placeId) return;
    const address = { descripcion: favorito.direccion, placeId: favorito.placeId, lat: favorito.lat, lng: favorito.lng };
    if (!comparador.origen) {
      comparador.setOrigen(address);
    } else if (!comparador.destino) {
      comparador.setDestino(address);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}>¿A dónde vas?</Text>
          <Text style={styles.subtitulo}>Captura tu trayecto para comparar opciones</Text>

          <SegmentedControl
            segments={[
              { value: 'direccion', label: 'Por dirección' },
              { value: 'manual', label: 'Kilómetros a mano' },
            ]}
            value={comparador.modoCaptura}
            onChange={comparador.setModoCaptura}
          />

          <View style={styles.seccion}>
            {comparador.modoCaptura === 'direccion' ? (
              <>
                {favoriteAddresses.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favoritos} contentContainerStyle={styles.favoritosContenido}>
                    {favoriteAddresses.map((favorito) => (
                      <TouchableOpacity key={favorito.id} style={styles.chip} onPress={() => handleFavoritoPress(favorito)}>
                        <Text style={styles.chipTexto}>{favorito.etiqueta}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : null}
                <AddressAutocompleteInput
                  label="Origen"
                  placeholder="¿Desde dónde sales?"
                  value={comparador.origen}
                  onChange={comparador.setOrigen}
                />
                <AddressAutocompleteInput
                  label="Destino"
                  placeholder="¿A dónde llegas?"
                  value={comparador.destino}
                  onChange={comparador.setDestino}
                />
              </>
            ) : (
              <View style={styles.campo}>
                <Text style={styles.label}>Distancia (km)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej. 25"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  value={comparador.distanciaManualKm}
                  onChangeText={comparador.setDistanciaManualKm}
                />
              </View>
            )}
          </View>

          <View style={styles.filaSwitch}>
            <Text style={styles.label}>Ida y vuelta</Text>
            <Switch
              value={comparador.idaYVuelta}
              onValueChange={comparador.setIdaYVuelta}
              trackColor={{ false: colors.borderSubtle, true: colors.primaryMuted }}
              thumbColor={comparador.idaYVuelta ? colors.primary : colors.textMuted}
            />
          </View>

          <Stepper
            label="Personas en el viaje"
            value={comparador.numPasajeros}
            onChange={comparador.setNumPasajeros}
          />

          {comparador.error ? <Text style={styles.error}>{comparador.error}</Text> : null}

          <TouchableOpacity
            style={[styles.boton, comparador.calculando && styles.botonDeshabilitado]}
            onPress={handleComparar}
            disabled={comparador.calculando}
          >
            <Text style={styles.botonTexto}>{comparador.calculando ? 'Calculando…' : 'Comparar opciones'}</Text>
          </TouchableOpacity>
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
  seccion: {
    marginTop: spacing.lg,
  },
  favoritos: {
    marginBottom: spacing.md,
  },
  favoritosContenido: {
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.backgroundElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipTexto: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
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
  filaSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  boton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonTexto: {
    color: colors.primaryContrastText,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold as any,
  },
});
