import type { MonthlyBudget } from '../types/models';
import { createEntityStorage } from './storage';
import { STORAGE_KEYS } from './storageKeys';

export const monthlyBudgetStorage = createEntityStorage<MonthlyBudget>(STORAGE_KEYS.monthlyBudget);
