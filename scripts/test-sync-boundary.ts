/**
 * Prueba de TIPOS (no de runtime): confirma que MotoProfile,
 * FavoriteAddress y CitySettings — "siempre local" según la sección 7 —
 * nunca pueden pasar como sincronizables, ni por accidente.
 *
 * Se valida con `npx tsc --noEmit` sobre todo el proyecto (incluye este
 * archivo), no ejecutando este script. Cada `// @ts-expect-error` de
 * abajo exige que esa línea produzca un error de compilación porque al
 * storage local le falta `syncTable`. Si alguna vez se rompe el límite
 * entre "siempre local" y "sincronizable" (p. ej. createEntityStorage
 * empieza a traer `syncTable` también), esas líneas dejan de fallar como
 * se espera y @ts-expect-error se vuelve un error "unused directive" —
 * tsc --noEmit truena, bloqueando el cambio.
 */
import type { SyncableEntityStorage } from '../services/storage';
import type { SyncableListStorage } from '../services/listStorage';
import { citySettingsStorage } from '../services/citySettingsStorage';
import { favoriteAddressStorage } from '../services/favoriteAddressStorage';
import { motoProfileStorage } from '../services/motoProfileStorage';
import { accountStorage } from '../services/accountStorage';
import { vehicleProfileStorage } from '../services/vehicleProfileStorage';
import { comparisonHistoryStorage } from '../services/comparisonHistoryStorage';
import type { CitySettings, FavoriteAddress, MotoProfile } from '../types/models';

function exigeSincronizable<T>(storage: SyncableEntityStorage<T>): void {
  void storage;
}

function exigeListaSincronizable<T extends { id: string }>(storage: SyncableListStorage<T>): void {
  void storage;
}

// --- Los 3 "siempre locales" NUNCA deben aceptar el tipo sincronizable ---

// @ts-expect-error MotoProfile es "siempre local" — motoProfileStorage no debe poder pasar como sincronizable.
exigeSincronizable<MotoProfile>(motoProfileStorage);

// @ts-expect-error CitySettings es "siempre local" — citySettingsStorage no debe poder pasar como sincronizable.
exigeSincronizable<CitySettings>(citySettingsStorage);

// @ts-expect-error FavoriteAddress es "siempre local" — favoriteAddressStorage no debe poder pasar como sincronizable.
exigeListaSincronizable<FavoriteAddress>(favoriteAddressStorage);

// --- Control positivo: los que SÍ se respaldan con cuenta compilan sin error ---
exigeSincronizable(accountStorage);
exigeSincronizable(vehicleProfileStorage);
exigeListaSincronizable(comparisonHistoryStorage);

export {};
