import type { CitySettings } from '../types/models';
import { createEntityStorage } from './storage';
import { STORAGE_KEYS } from './storageKeys';

export const citySettingsStorage = createEntityStorage<CitySettings>(STORAGE_KEYS.citySettings);
