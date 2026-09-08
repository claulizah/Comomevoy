import type { MonthlyBudget } from '../types/models';
import { createSyncableEntityStorage } from './storage';
import { STORAGE_KEYS } from './storageKeys';

/** Se respalda con cuenta (sección 7) — ver types/sync.ts. */
export const monthlyBudgetStorage = createSyncableEntityStorage<MonthlyBudget>(STORAGE_KEYS.monthlyBudget, 'monthly_budgets');
