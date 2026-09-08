import { useCallback, useEffect, useState } from 'react';
import type { ListStorage } from '../services/listStorage';

/**
 * Encapsula leer/escribir una lista persistida como React state. Base
 * reusable para useFavoriteAddresses, useComparisonHistory y
 * useFrequentRoutes (mismo espíritu que usePersistedEntity, pero para
 * colecciones en vez de un solo valor).
 */
export function useListStorage<T extends { id: string }>(storage: ListStorage<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const lista = await storage.list();
    setItems(lista);
    setLoading(false);
  }, [storage]);

  useEffect(() => {
    let activo = true;
    (async () => {
      const lista = await storage.list();
      if (activo) {
        setItems(lista);
        setLoading(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [storage]);

  const add = useCallback(
    async (item: T) => {
      await storage.add(item);
      setItems((prev) => [...prev, item]);
    },
    [storage]
  );

  const update = useCallback(
    async (id: string, patch: Partial<T>) => {
      await storage.update(id, patch);
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    },
    [storage]
  );

  const remove = useCallback(
    async (id: string) => {
      await storage.remove(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
    },
    [storage]
  );

  return { items, loading, add, update, remove, reload };
}
