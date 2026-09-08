import type { VehicleProfile } from '../types/models';
import { createSyncableEntityStorage } from './storage';
import { STORAGE_KEYS } from './storageKeys';

/** Se respalda con cuenta (sección 7) — ver types/sync.ts. */
export const vehicleProfileStorage = createSyncableEntityStorage<VehicleProfile>(STORAGE_KEYS.vehicleProfile, 'vehicle_profiles');
