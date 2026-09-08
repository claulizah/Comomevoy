import type { FavoriteAddress } from '../types/models';
import { createEntityStorage } from './storage';
import { createListStorage } from './listStorage';
import { STORAGE_KEYS } from './storageKeys';

export const favoriteAddressStorage = createListStorage<FavoriteAddress>(
  createEntityStorage<FavoriteAddress[]>(STORAGE_KEYS.favoriteAddresses)
);
