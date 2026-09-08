/**
 * Prueba de runtime (complementaria a scripts/test-sync-boundary.ts, que
 * es de tipos): corre con `npm run test:sync-registry`.
 *
 * Confirma que el registro de sincronización (services/syncRegistry.ts)
 * — la única lista que el motor de sync real recorrerá — contiene
 * exactamente las 5 tablas esperadas, y que los 3 storages "siempre
 * locales" no traen `syncTable` en tiempo de ejecución (red de
 * seguridad extra por si alguna vez alguien usa `as any` para saltarse
 * el chequeo de tipos).
 */
import { SYNCABLE_ENTITY_STORAGES, SYNCABLE_LIST_STORAGES, tablasSincronizables } from '../services/syncRegistry';
import { citySettingsStorage } from '../services/citySettingsStorage';
import { favoriteAddressStorage } from '../services/favoriteAddressStorage';
import { motoProfileStorage } from '../services/motoProfileStorage';

let fallas = 0;

function assert(condicion: boolean, mensaje: string) {
  if (!condicion) {
    fallas += 1;
    console.error(`✗ ${mensaje}`);
  } else {
    console.log(`✓ ${mensaje}`);
  }
}

const TABLAS_ESPERADAS = ['vehicle_profiles', 'monthly_budgets', 'accounts', 'comparison_history', 'frequent_routes'].sort();

async function main() {
  const tablas = tablasSincronizables().slice().sort();
  assert(
    JSON.stringify(tablas) === JSON.stringify(TABLAS_ESPERADAS),
    `El registro sincroniza exactamente las 5 tablas esperadas (actual=${JSON.stringify(tablas)})`
  );
  assert(new Set(tablas).size === tablas.length, 'No hay tablas duplicadas en el registro');
  assert(SYNCABLE_ENTITY_STORAGES.length + SYNCABLE_LIST_STORAGES.length === 5, 'El registro tiene exactamente 5 storages (3 entity + 2 list)');

  // Red de seguridad en runtime: aunque alguien se salte el chequeo de
  // tipos con `as any`, estos 3 storages "siempre locales" no deben
  // tener la propiedad `syncTable` que el motor de sync usa para elegir
  // a qué tabla escribir.
  assert(!('syncTable' in motoProfileStorage), 'motoProfileStorage no trae syncTable en runtime (nunca se sincroniza)');
  assert(!('syncTable' in citySettingsStorage), 'citySettingsStorage no trae syncTable en runtime (nunca se sincroniza)');
  assert(!('syncTable' in favoriteAddressStorage), 'favoriteAddressStorage no trae syncTable en runtime (nunca se sincroniza)');

  // Y que ninguna de las 3 tablas "prohibidas" aparezca por accidente
  // bajo ningún nombre en el registro sincronizable.
  const nombresProhibidos = ['moto_profiles', 'favorite_addresses', 'city_settings'];
  for (const nombre of nombresProhibidos) {
    assert(!tablas.includes(nombre), `"${nombre}" (siempre local) no aparece en las tablas sincronizables`);
  }

  console.log(fallas === 0 ? '\nTodo bien.' : `\n${fallas} prueba(s) fallaron.`);
  process.exit(fallas === 0 ? 0 : 1);
}

main();
