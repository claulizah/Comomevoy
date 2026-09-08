/**
 * Prueba manual (sin Jest/RN) de la detección de ruta frecuente.
 * Corre con: npm run test:ruta-frecuente
 *
 * Igual que scripts/test-motor-comparacion.ts: fakes de ListStorage en
 * memoria en vez de AsyncStorage real, para probar la lógica real de
 * services/frequentRouteService.ts sin depender del runtime de RN.
 */
import {
  contarRepeticiones,
  esMismaRuta,
  evaluarRutaFrecuente,
  guardarComoRutaFrecuente,
  UMBRAL_SUGERENCIA_RUTA_FRECUENTE,
  VENTANA_DETECCION_DIAS,
  type RutaComparable,
} from '../services/frequentRouteService';
import { generateId } from '../services/id';
import type { ListStorage } from '../services/listStorage';
import type { ComparisonHistory, FrequentRoute } from '../types/models';

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

function fakeListStorage<T extends { id: string }>(disco: Map<string, T[]>, key: string): ListStorage<T> {
  return {
    async list() {
      return disco.get(key) ?? [];
    },
    async add(item: T) {
      disco.set(key, [...(disco.get(key) ?? []), item]);
    },
    async update(id: string, patch: Partial<T>) {
      const items = disco.get(key) ?? [];
      disco.set(key, items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
    },
    async remove(id: string) {
      disco.set(key, (disco.get(key) ?? []).filter((it) => it.id !== id));
    },
  };
}

function entradaHistorial(overrides: Partial<ComparisonHistory>): ComparisonHistory {
  return {
    id: generateId(),
    fecha: new Date().toISOString(),
    distanciaKm: 25,
    resultadosPorModo: [],
    opcionGanadora: 'transporte_publico',
    ...overrides,
  };
}

function hace(dias: number): string {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
}

async function main() {
  // --- 1. esMismaRuta: criterio documentado en frequentRouteService.ts ---
  const casaTrabajo: RutaComparable = { origen: 'Casa, CDMX', destino: 'Trabajo, CDMX', distanciaKm: 12 };
  const casaTrabajoOtroCase = { origen: '  casa, cdmx ', destino: 'TRABAJO, CDMX', distanciaKm: 12 };
  const trabajoCasa: RutaComparable = { origen: 'Trabajo, CDMX', destino: 'Casa, CDMX', distanciaKm: 12 };
  const manual25: RutaComparable = { distanciaKm: 25 };
  const manual25punto8: RutaComparable = { distanciaKm: 25.8 }; // dentro de tolerancia (±1.25km)
  const manual30: RutaComparable = { distanciaKm: 30 }; // fuera de tolerancia

  assert(esMismaRuta(casaTrabajo, casaTrabajoOtroCase), 'Misma dirección normalizada (mayúsculas/espacios) cuenta como la misma ruta');
  assert(!esMismaRuta(casaTrabajo, trabajoCasa), 'A→B no es la misma ruta que B→A (sensible a dirección)');
  assert(esMismaRuta(manual25, manual25punto8), 'Distancias manuales dentro de la tolerancia (±5%/±1km) son la misma ruta');
  assert(!esMismaRuta(manual25, manual30), 'Distancias manuales fuera de la tolerancia no son la misma ruta');
  assert(!esMismaRuta(casaTrabajo, manual25), 'Una ruta por dirección nunca es la misma que una manual');

  // --- 2. contarRepeticiones respeta la ventana de detección ---
  const historialConVentana: ComparisonHistory[] = [
    entradaHistorial({ origen: casaTrabajo.origen, destino: casaTrabajo.destino, fecha: hace(1) }),
    entradaHistorial({ origen: casaTrabajo.origen, destino: casaTrabajo.destino, fecha: hace(2) }),
    entradaHistorial({ origen: casaTrabajo.origen, destino: casaTrabajo.destino, fecha: hace(VENTANA_DETECCION_DIAS + 3) }), // fuera de la ventana
  ];
  assertEqual(
    contarRepeticiones(casaTrabajo, historialConVentana),
    2,
    `contarRepeticiones ignora ocurrencias de hace más de ${VENTANA_DETECCION_DIAS} días`
  );

  // --- 3. evaluarRutaFrecuente: flujo completo con storages fake ---
  const disco = new Map<string, unknown[]>();
  const historyStorage = fakeListStorage<ComparisonHistory>(disco as Map<string, ComparisonHistory[]>, 'historial');
  const routeStorage = fakeListStorage<FrequentRoute>(disco as Map<string, FrequentRoute[]>, 'rutasFrecuentes');

  // 2 veces esta semana: todavía no debe ofrecer guardar.
  await historyStorage.add(entradaHistorial({ origen: casaTrabajo.origen, destino: casaTrabajo.destino, fecha: hace(1) }));
  await historyStorage.add(entradaHistorial({ origen: casaTrabajo.origen, destino: casaTrabajo.destino, fecha: hace(2) }));
  let evaluacion = await evaluarRutaFrecuente(casaTrabajo, historyStorage, routeStorage);
  assertEqual(evaluacion.repeticiones, 2, 'Con 2 repeticiones en la semana, el conteo es 2');
  assert(!evaluacion.debeSugerirGuardar, `Con menos de ${UMBRAL_SUGERENCIA_RUTA_FRECUENTE} repeticiones, no ofrece guardar como ruta frecuente`);
  assert(!evaluacion.debeNotificar, 'Con menos del umbral, no dispara notificación');

  // 3ra vez (el mismo trayecto que se acaba de registrar): ahora sí.
  await historyStorage.add(entradaHistorial({ origen: casaTrabajo.origen, destino: casaTrabajo.destino, fecha: hace(0) }));
  evaluacion = await evaluarRutaFrecuente(casaTrabajo, historyStorage, routeStorage);
  assertEqual(evaluacion.repeticiones, UMBRAL_SUGERENCIA_RUTA_FRECUENTE, `Al llegar a ${UMBRAL_SUGERENCIA_RUTA_FRECUENTE} repeticiones, el conteo coincide con el umbral`);
  assert(evaluacion.debeSugerirGuardar, 'Al llegar al umbral y no estar guardada, ofrece guardar como ruta frecuente');
  assert(evaluacion.debeNotificar, 'Al llegar al umbral por primera vez, dispara la notificación local');
  assert(!evaluacion.yaGuardada, 'Todavía no estaba guardada como ruta frecuente');

  // La usuaria acepta guardarla.
  const guardada = await guardarComoRutaFrecuente(
    { ...casaTrabajo, repeticiones: evaluacion.repeticiones, opcionGanadora: 'transporte_publico' },
    routeStorage
  );
  assertEqual(guardada.vecesUsada, UMBRAL_SUGERENCIA_RUTA_FRECUENTE, 'Al guardar, vecesUsada arranca en las repeticiones ya detectadas');

  // 4ta vez: ya está guardada, así que solo debe sumar uso, no volver a ofrecer ni notificar.
  await historyStorage.add(entradaHistorial({ origen: casaTrabajo.origen, destino: casaTrabajo.destino, fecha: hace(0) }));
  evaluacion = await evaluarRutaFrecuente(casaTrabajo, historyStorage, routeStorage);
  assert(evaluacion.yaGuardada, 'La 4ta vez, la ruta ya aparece como guardada');
  assert(!evaluacion.debeSugerirGuardar, 'Una vez guardada, no se vuelve a ofrecer guardar');
  assert(!evaluacion.debeNotificar, 'Una vez guardada, no se vuelve a notificar');

  const rutasFrecuentesFinal = await routeStorage.list();
  assertEqual(rutasFrecuentesFinal.length, 1, 'Sigue habiendo una sola ruta frecuente guardada (no se duplicó)');
  assertEqual(rutasFrecuentesFinal[0].vecesUsada, UMBRAL_SUGERENCIA_RUTA_FRECUENTE + 1, 'vecesUsada se incrementó en el 4to uso');

  console.log(fallas === 0 ? '\nTodo bien.' : `\n${fallas} prueba(s) fallaron.`);
  process.exit(fallas === 0 ? 0 : 1);
}

main();
