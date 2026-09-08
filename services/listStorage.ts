import type { EntityStorage } from './storage';

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
