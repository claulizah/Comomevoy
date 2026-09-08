import type { FrequentRoute } from '../types/models';
import { createEntityStorage } from './storage';
import { createListStorage } from './listStorage';
import { STORAGE_KEYS } from './storageKeys';

export const frequentRouteStorage = createListStorage<FrequentRoute>(
  createEntityStorage<FrequentRoute[]>(STORAGE_KEYS.frequentRoutes)
);
