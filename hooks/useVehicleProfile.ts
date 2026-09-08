import { vehicleProfileStorage } from '../services/vehicleProfileStorage';
import { usePersistedEntity } from './usePersistedEntity';

export function useVehicleProfile() {
  const { value, loading, save } = usePersistedEntity(vehicleProfileStorage);
  return { vehicleProfile: value, loadingVehicleProfile: loading, saveVehicleProfile: save };
}
