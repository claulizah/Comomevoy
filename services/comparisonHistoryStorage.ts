import type { ComparisonHistory } from '../types/models';
import { createSyncableEntityStorage } from './storage';
import { createSyncableListStorage } from './listStorage';
import { STORAGE_KEYS } from './storageKeys';

/** Se respalda con cuenta (sección 7) — ver types/sync.ts. */
export const comparisonHistoryStorage = createSyncableListStorage<ComparisonHistory>(
  createSyncableEntityStorage<ComparisonHistory[]>(STORAGE_KEYS.comparisonHistory, 'comparison_history')
);
