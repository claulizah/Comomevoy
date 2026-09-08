import { frequentRouteStorage } from '../services/frequentRouteStorage';
import { useListStorage } from './useListStorage';

export function useFrequentRoutes() {
  const { items, loading, remove, reload } = useListStorage(frequentRouteStorage);
  return {
    frequentRoutes: items,
    loadingFrequentRoutes: loading,
    removeFrequentRoute: remove,
    reloadFrequentRoutes: reload,
  };
}
