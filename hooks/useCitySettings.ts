import { citySettingsStorage } from '../services/citySettingsStorage';
import { usePersistedEntity } from './usePersistedEntity';

export function useCitySettings() {
  const { value, loading, save } = usePersistedEntity(citySettingsStorage);
  return { citySettings: value, loadingCitySettings: loading, saveCitySettings: save };
}
