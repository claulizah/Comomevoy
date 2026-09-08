import type { SyncableEntityStorage } from './storage';
import type { SyncableListStorage } from './listStorage';
import type { SyncableTable } from '../types/sync';
import { accountStorage } from './accountStorage';
import { comparisonHistoryStorage } from './comparisonHistoryStorage';
import { frequentRouteStorage } from './frequentRouteStorage';
import { monthlyBudgetStorage } from './monthlyBudgetStorage';
import { vehicleProfileStorage } from './vehicleProfileStorage';

/**
 * ÚNICA lista que el motor de sincronización real (pendiente de
 * credenciales de Supabase) debe recorrer para subir/bajar datos.
 *
 * Las anotaciones de tipo explícitas de abajo (SyncableEntityStorage<...>[]
 * / SyncableListStorage<...>[]) son lo que de verdad aplica el límite: un
 * storage "siempre local" (createEntityStorage/createListStorage sin
 * syncTable — motoProfileStorage, favoriteAddressStorage,
 * citySettingsStorage) no tiene la forma de SyncableEntityStorage/
 * SyncableListStorage, así que agregarlo aquí por accidente es un error
 * de compilación, no algo que dependa de acordarse de una convención.
 * Ver scripts/test-sync-boundary.ts para la prueba explícita de esto.
 */
export const SYNCABLE_ENTITY_STORAGES: Array<SyncableEntityStorage<unknown>> = [
  vehicleProfileStorage,
  monthlyBudgetStorage,
  accountStorage,
];

export const SYNCABLE_LIST_STORAGES: Array<SyncableListStorage<{ id: string }>> = [comparisonHistoryStorage, frequentRouteStorage];

export function tablasSincronizables(): SyncableTable[] {
  return [...SYNCABLE_ENTITY_STORAGES.map((s) => s.syncTable), ...SYNCABLE_LIST_STORAGES.map((s) => s.syncTable)];
}
