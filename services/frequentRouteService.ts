import type { ComparisonHistory, FrequentRoute } from '../types/models';
import { generateId } from './id';
import { frequentRouteStorage } from './frequentRouteStorage';
import { comparisonHistoryStorage } from './comparisonHistoryStorage';
import type { ListStorage } from './listStorage';

/**
 * Criterio de "misma ruta" (no viene de la especificación, documentado
 * igual que kmMensualesReferencia):
 * - Si ambos trayectos tienen origen Y destino (captura por dirección),
 *   son la misma ruta si el texto normalizado de origen Y destino
 *   coinciden exactamente. Sensible a la dirección del viaje: A→B no
 *   cuenta como lo mismo que B→A (son trayectos distintos en la vida real).
 * - Si ninguno tiene origen/destino (captura manual, solo km), son la
 *   misma ruta si la distancia difiere en menos de una tolerancia de
 *   ±1 km o ±5% de la distancia (lo que sea mayor) — así no se exige
 *   escribir exactamente el mismo número cada vez.
 * - Un trayecto por dirección nunca hace match con uno manual.
 *
 * Ventana de detección: solo se cuentan repeticiones dentro de los
 * últimos 7 días (VENTANA_DETECCION_DIAS), para que el aviso hable de
 * "esta semana" como en el ejemplo de la especificación.
 */
export const UMBRAL_SUGERENCIA_RUTA_FRECUENTE = 3;
export const VENTANA_DETECCION_DIAS = 7;

export interface RutaComparable {
  origen?: string;
  destino?: string;
  distanciaKm: number;
}

export interface SugerenciaRutaFrecuente extends RutaComparable {
  repeticiones: number;
  opcionGanadora: string;
}

function normalizar(texto: string): string {
  return texto.trim().toLowerCase();
}

function toleranciaKm(distanciaKm: number): number {
  return Math.max(1, distanciaKm * 0.05);
}

export function esMismaRuta(a: RutaComparable, b: RutaComparable): boolean {
  const aEsDireccion = !!a.origen && !!a.destino;
  const bEsDireccion = !!b.origen && !!b.destino;
  if (aEsDireccion !== bEsDireccion) return false;
  if (aEsDireccion && bEsDireccion) {
    return normalizar(a.origen!) === normalizar(b.origen!) && normalizar(a.destino!) === normalizar(b.destino!);
  }
  return Math.abs(a.distanciaKm - b.distanciaKm) <= toleranciaKm(a.distanciaKm);
}

export function contarRepeticiones(
  ruta: RutaComparable,
  historial: ComparisonHistory[],
  ventanaDias: number = VENTANA_DETECCION_DIAS,
  ahora: Date = new Date()
): number {
  const limite = ahora.getTime() - ventanaDias * 24 * 60 * 60 * 1000;
  return historial.filter((entry) => new Date(entry.fecha).getTime() >= limite && esMismaRuta(ruta, entry)).length;
}

export function buscarRutaFrecuenteExistente(ruta: RutaComparable, rutasFrecuentes: FrequentRoute[]): FrequentRoute | undefined {
  return rutasFrecuentes.find((r) => esMismaRuta(ruta, r));
}

export function formatearRutaDescripcion(ruta: RutaComparable): string {
  if (ruta.origen && ruta.destino) return `${ruta.origen} → ${ruta.destino}`;
  return `un trayecto de ${Math.round(ruta.distanciaKm)} km`;
}

export interface EvaluacionRutaFrecuente {
  repeticiones: number;
  yaGuardada: boolean;
  debeSugerirGuardar: boolean;
  debeNotificar: boolean;
}

/**
 * Se llama después de registrar cada comparación en el historial (ver
 * hooks/useComparador.ts). Si la ruta ya está guardada como frecuente,
 * incrementa vecesUsada. Si no, decide si ya toca ofrecer guardarla
 * (debeSugerirGuardar) y si toca disparar la notificación local
 * (debeNotificar — solo la primera vez que se cruza el umbral, para no
 * repetir el aviso en cada comparación siguiente).
 */
export async function evaluarRutaFrecuente(
  ruta: RutaComparable,
  historyStorage: { list(): Promise<ComparisonHistory[]> } = comparisonHistoryStorage,
  routeStorage: ListStorage<FrequentRoute> = frequentRouteStorage
): Promise<EvaluacionRutaFrecuente> {
  const historial = await historyStorage.list();
  const repeticiones = contarRepeticiones(ruta, historial);
  const rutasFrecuentes = await routeStorage.list();
  const existente = buscarRutaFrecuenteExistente(ruta, rutasFrecuentes);

  if (existente) {
    await routeStorage.update(existente.id, { vecesUsada: existente.vecesUsada + 1 });
  }

  return {
    repeticiones,
    yaGuardada: !!existente,
    debeSugerirGuardar: !existente && repeticiones >= UMBRAL_SUGERENCIA_RUTA_FRECUENTE,
    debeNotificar: !existente && repeticiones === UMBRAL_SUGERENCIA_RUTA_FRECUENTE,
  };
}

export async function guardarComoRutaFrecuente(
  sugerencia: SugerenciaRutaFrecuente,
  routeStorage: ListStorage<FrequentRoute> = frequentRouteStorage
): Promise<FrequentRoute> {
  const nueva: FrequentRoute = {
    id: generateId(),
    origen: sugerencia.origen,
    destino: sugerencia.destino,
    distanciaKm: sugerencia.distanciaKm,
    opcionGanadora: sugerencia.opcionGanadora,
    vecesUsada: sugerencia.repeticiones,
  };
  await routeStorage.add(nueva);
  return nueva;
}
