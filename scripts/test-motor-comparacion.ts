/**
 * Prueba manual (sin Jest/RN) del motor de comparación + persistencia.
 * Corre con: npm run test:motor
 *
 * Usa fakes de EntityStorage (en memoria) en vez de AsyncStorage real,
 * inyectados en LocalRatesProvider — así se prueba la lógica real de
 * fusión de perfil/tarifas sin depender del runtime de React Native.
 */
import { compararTrayecto } from '../services/comparadorService';
import { defaultCitySettings, defaultVehicleProfile, LocalRatesProvider } from '../services/ratesService';
import type { EntityStorage } from '../services/storage';
import type { CitySettings, MotoProfile, VehicleProfile } from '../types/models';

let fallas = 0;

function assert(condicion: boolean, mensaje: string) {
  if (!condicion) {
    fallas += 1;
    console.error(`✗ ${mensaje}`);
  } else {
    console.log(`✓ ${mensaje}`);
  }
}

function assertEqual<T>(actual: T, esperado: T, mensaje: string) {
  assert(actual === esperado, `${mensaje} (esperado=${esperado}, actual=${actual})`);
}

/** Fake de EntityStorage respaldado por un Map en memoria (simula AsyncStorage). */
function fakeStorage<T>(backingStore: Map<string, unknown>, key: string): EntityStorage<T> {
  return {
    async get() {
      return backingStore.has(key) ? (backingStore.get(key) as T) : null;
    },
    async save(value: T) {
      backingStore.set(key, value);
    },
  };
}

async function main() {
  // Backing store compartido: simula el disco real de AsyncStorage,
  // que persiste aunque la app (el provider) se vuelva a instanciar.
  const disco = new Map<string, unknown>();
  const vehicleStorage = fakeStorage<VehicleProfile>(disco, 'vehicleProfile');
  const cityStorage = fakeStorage<CitySettings>(disco, 'citySettings');
  const motoStorage = fakeStorage<MotoProfile>(disco, 'motoProfile');

  // 1. "Primer arranque": nada guardado -> el motor usa los defaults.
  const providerInicial = new LocalRatesProvider(vehicleStorage, cityStorage, motoStorage);
  const ratesInicial = await providerInicial.getRates();
  assertEqual(ratesInicial.auto.rendimientoKmPorLitro, defaultVehicleProfile.rendimientoKmPorLitro, 'Sin perfil guardado, usa el rendimiento por defecto');
  assertEqual(ratesInicial.uberDidi.tarifaUberDidi, defaultCitySettings.tarifaUberDidi, 'Sin CitySettings guardado, usa la tarifa Uber/DiDi por defecto');

  // 2. La usuaria guarda su perfil real (como haría PerfilAuto/Onboarding).
  const perfilPersonalizado: VehicleProfile = {
    ...defaultVehicleProfile,
    rendimientoKmPorLitro: 18,
    precioGasolinaPorLitro: 22,
  };
  const ciudadPersonalizada: CitySettings = {
    ciudad: 'Guadalajara',
    tarifaUberDidi: 5.8,
    tarifaTransportePublico: 9.5,
    tarifaBlaBlaCar: 1.4,
  };
  await vehicleStorage.save(perfilPersonalizado);
  await cityStorage.save(ciudadPersonalizada);

  // 3. Simula "reiniciar la app": una instancia NUEVA de LocalRatesProvider
  //    (el objeto en memoria de antes ya no existe), leyendo del mismo
  //    disco. Si el motor de verdad persistió, debe ver el perfil nuevo.
  const providerReiniciado = new LocalRatesProvider(vehicleStorage, cityStorage, motoStorage);
  const ratesDespuesDeReiniciar = await providerReiniciado.getRates();

  assertEqual(ratesDespuesDeReiniciar.auto.rendimientoKmPorLitro, 18, 'Tras "reiniciar la app", usa el rendimiento guardado, no el default');
  assertEqual(ratesDespuesDeReiniciar.auto.precioGasolinaPorLitro, 22, 'Tras "reiniciar la app", usa el precio de gasolina guardado');
  assertEqual(ratesDespuesDeReiniciar.uberDidi.tarifaUberDidi, 5.8, 'Tras "reiniciar la app", usa la tarifa Uber/DiDi de la ciudad guardada');

  // 4. El motor de comparación completo también debe reflejar el cambio:
  //    mismo trayecto, costo de auto distinto porque el perfil es distinto.
  const trayecto = { modoCaptura: 'manual' as const, distanciaKm: 50, idaYVuelta: false, numPasajeros: 1 };
  const resultadoDefault = compararTrayecto(trayecto, ratesInicial);
  const resultadoPersonalizado = compararTrayecto(trayecto, ratesDespuesDeReiniciar);
  const costoAutoDefault = resultadoDefault.opciones.find((o) => o.modo === 'auto')!.costoTotal;
  const costoAutoPersonalizado = resultadoPersonalizado.opciones.find((o) => o.modo === 'auto')!.costoTotal;

  assert(costoAutoPersonalizado !== costoAutoDefault, `compararTrayecto usa el perfil guardado (costo default=${costoAutoDefault.toFixed(2)}, personalizado=${costoAutoPersonalizado.toFixed(2)})`);
  assert(costoAutoPersonalizado < costoAutoDefault, 'El perfil personalizado (mejor rendimiento, gasolina más barata) da un costo de auto menor');

  console.log(fallas === 0 ? '\nTodo bien.' : `\n${fallas} prueba(s) fallaron.`);
  process.exit(fallas === 0 ? 0 : 1);
}

main();
