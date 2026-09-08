/**
 * Única fuente de verdad de qué entidades se sincronizan a Supabase
 * ("se respalda con cuenta" en la sección 7) y a qué tabla corresponde
 * cada una. Ver services/storage.ts / services/listStorage.ts: un storage
 * solo lleva `syncTable` si se construyó con
 * createSyncableEntityStorage/createSyncableListStorage — el motor de
 * sincronización (services/syncService.ts) exige ese tipo, así que un
 * storage "siempre local" (createEntityStorage/createListStorage a secas,
 * sin syncTable) es rechazado por TypeScript en tiempo de compilación,
 * no solo por convención de nombre de archivo.
 */
export type SyncableTable = 'vehicle_profiles' | 'comparison_history' | 'frequent_routes' | 'monthly_budgets' | 'accounts';
