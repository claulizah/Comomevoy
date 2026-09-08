import type { ComparisonHistory } from '../types/models';
import { createEntityStorage } from './storage';
import { createListStorage } from './listStorage';
import { STORAGE_KEYS } from './storageKeys';

export const comparisonHistoryStorage = createListStorage<ComparisonHistory>(
  createEntityStorage<ComparisonHistory[]>(STORAGE_KEYS.comparisonHistory)
);
