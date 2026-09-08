import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SyncableTable } from '../types/sync';

/**
 * Boundary de persistencia local. Todo lo que hoy es "siempre local" o
 * "se respalda con cuenta" (sección 7) vive en AsyncStorage; lo que
 * además se respalda con cuenta se sincroniza a Supabase (ver
 * services/syncService.ts) cuando hay sesión activa.
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

/**
 * Un EntityStorage "marcado" como sincronizable con Supabase. El único
 * modo de obtener uno es createSyncableEntityStorage — nunca por casting
 * ni por convención de nombre — así que el motor de sync puede exigir
 * este tipo en su firma y el compilador rechaza pasarle un
 * EntityStorage<T> normal (p. ej. citySettingsStorage/motoProfileStorage,
 * que deben quedarse siempre locales). Ver
 * scripts/test-sync-boundary.ts para la prueba explícita de este límite.
 */
export interface SyncableEntityStorage<T> extends EntityStorage<T> {
  readonly syncTable: SyncableTable;
}

export function createSyncableEntityStorage<T>(key: string, syncTable: SyncableTable): SyncableEntityStorage<T> {
  return { ...createEntityStorage<T>(key), syncTable };
}
