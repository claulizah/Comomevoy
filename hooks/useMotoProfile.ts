import { motoProfileStorage } from '../services/motoProfileStorage';
import { usePersistedEntity } from './usePersistedEntity';

/**
 * Listo para cuando se construya la pantalla "Perfil de moto" (sección 6:
 * "Después"/premium — ver constants/featureFlags.ts). No se usa en
 * ninguna pantalla todavía.
 */
export function useMotoProfile() {
  const { value, loading, save } = usePersistedEntity(motoProfileStorage);
  return { motoProfile: value, loadingMotoProfile: loading, saveMotoProfile: save };
}
