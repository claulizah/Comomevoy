import type { VehicleProfile } from '../types/models';
import { createEntityStorage } from './storage';
import { STORAGE_KEYS } from './storageKeys';

export const vehicleProfileStorage = createEntityStorage<VehicleProfile>(STORAGE_KEYS.vehicleProfile);
