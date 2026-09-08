import type { MotoProfile } from '../types/models';
import { createEntityStorage } from './storage';
import { STORAGE_KEYS } from './storageKeys';

export const motoProfileStorage = createEntityStorage<MotoProfile>(STORAGE_KEYS.motoProfile);
