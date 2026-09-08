import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Boundary de persistencia local. Todo lo que hoy es "siempre local" o
 * "se respalda con cuenta" (sección 7) vive por ahora solo en
 * AsyncStorage — la sincronización con Supabase queda para un prompt
 * futuro, pero al pasar por esta interfaz el cambio no debería tocar
 * hooks ni pantallas.
 */
export interface EntityStorage<T> {
  get(): Promise<T | null>;
  save(value: T): Promise<void>;
}

export function createEntityStorage<T>(key: string): EntityStorage<T> {
  return {
    async get() {
      const raw = await AsyncStorage.getItem(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
    async save(value: T) {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    },
  };
}
