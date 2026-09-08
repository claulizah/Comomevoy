import { favoriteAddressStorage } from '../services/favoriteAddressStorage';
import { useListStorage } from './useListStorage';

export function useFavoriteAddresses() {
  const { items, loading, add, update, remove } = useListStorage(favoriteAddressStorage);
  return {
    favoriteAddresses: items,
    loadingFavoriteAddresses: loading,
    addFavoriteAddress: add,
    updateFavoriteAddress: update,
    removeFavoriteAddress: remove,
  };
}
