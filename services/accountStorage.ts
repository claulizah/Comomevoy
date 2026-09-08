import type { Account } from '../types/models';
import { createSyncableEntityStorage } from './storage';
import { STORAGE_KEYS } from './storageKeys';

/**
 * Se respalda con cuenta (sección 7) — ver types/sync.ts. Caché local del
 * registro de cuenta; se llena cuando exista el flujo de inicio de
 * sesión (pendiente de credenciales de Supabase).
 */
export const accountStorage = createSyncableEntityStorage<Account>(STORAGE_KEYS.account, 'accounts');
