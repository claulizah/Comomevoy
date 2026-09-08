import type { FrequentRoute } from '../types/models';
import { createSyncableEntityStorage } from './storage';
import { createSyncableListStorage } from './listStorage';
import { STORAGE_KEYS } from './storageKeys';

/** Se respalda con cuenta (sección 7) — ver types/sync.ts. */
export const frequentRouteStorage = createSyncableListStorage<FrequentRoute>(
  createSyncableEntityStorage<FrequentRoute[]>(STORAGE_KEYS.frequentRoutes, 'frequent_routes')
);
