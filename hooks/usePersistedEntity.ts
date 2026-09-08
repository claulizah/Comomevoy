import { useCallback, useEffect, useState } from 'react';
import type { EntityStorage } from '../services/storage';

/**
 * Encapsula leer/escribir una entidad en AsyncStorage (vía EntityStorage)
 * como React state. Base reusable para useVehicleProfile, useCitySettings
 * y, cuando se active la pantalla de perfil de moto, useMotoProfile.
 */
export function usePersistedEntity<T>(storage: EntityStorage<T>) {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;
    setLoading(true);
    storage.get().then((stored) => {
      if (activo) {
        setValue(stored);
        setLoading(false);
      }
    });
    return () => {
      activo = false;
    };
  }, [storage]);

  const save = useCallback(
    async (nuevoValor: T) => {
      await storage.save(nuevoValor);
      setValue(nuevoValor);
    },
    [storage]
  );

  return { value, loading, save };
}
