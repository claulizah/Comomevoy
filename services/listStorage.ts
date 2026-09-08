import type { EntityStorage, SyncableEntityStorage } from './storage';
import type { SyncableTable } from '../types/sync';

/**
 * CRUD sobre una lista persistida como un solo EntityStorage<T[]> (mismo
 * patrón/primitiva que VehicleProfile/CitySettings, solo que el "valor"
 * guardado es un arreglo). Usado por FavoriteAddress, ComparisonHistory
 * y FrequentRoute. Recibe el EntityStorage<T[]> ya armado (en vez de la
 * key) para poder inyectar un fake en pruebas, igual que LocalRatesProvider.
 */
export interface ListStorage<T extends { id: string }> {
  list(): Promise<T[]>;
  add(item: T): Promise<void>;
  update(id: string, patch: Partial<T>): Promise<void>;
  remove(id: string): Promise<void>;
}

export function createListStorage<T extends { id: string }>(entityStorage: EntityStorage<T[]>): ListStorage<T> {
  async function list(): Promise<T[]> {
    return (await entityStorage.get()) ?? [];
  }

  return {
    list,
    async add(item: T) {
      const items = await list();
      await entityStorage.save([...items, item]);
    },
    async update(id: string, patch: Partial<T>) {
      const items = await list();
      await entityStorage.save(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    },
    async remove(id: string) {
      const items = await list();
      await entityStorage.save(items.filter((it) => it.id !== id));
    },
  };
}

/**
 * Un ListStorage "marcado" como sincronizable — mismo mecanismo que
 * SyncableEntityStorage (ver services/storage.ts): solo se obtiene
 * llamando a createSyncableListStorage, así el motor de sync puede exigir
 * este tipo y el compilador rechaza un ListStorage normal (p. ej.
 * favoriteAddressStorage, que debe quedarse siempre local).
 */
export interface SyncableListStorage<T extends { id: string }> extends ListStorage<T> {
  readonly syncTable: SyncableTable;
}

export function createSyncableListStorage<T extends { id: string }>(
  entityStorage: SyncableEntityStorage<T[]>
): SyncableListStorage<T> {
  return { ...createListStorage<T>(entityStorage), syncTable: entityStorage.syncTable };
}
