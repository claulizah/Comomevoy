import { comparisonHistoryStorage } from '../services/comparisonHistoryStorage';
import { useListStorage } from './useListStorage';

export function useComparisonHistory() {
  const { items, loading, remove, reload } = useListStorage(comparisonHistoryStorage);
  return {
    history: items,
    loadingHistory: loading,
    removeHistoryEntry: remove,
    reloadHistory: reload,
  };
}
