import { monthlyBudgetStorage } from '../services/monthlyBudgetStorage';
import { usePersistedEntity } from './usePersistedEntity';

export function useMonthlyBudget() {
  const { value, loading, save } = usePersistedEntity(monthlyBudgetStorage);
  return { monthlyBudget: value, loadingMonthlyBudget: loading, saveMonthlyBudget: save };
}
