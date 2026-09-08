import type { Address, ResultadoComparacion } from '../types/comparador';
import type { ComparisonHistory } from '../types/models';
import { generateId } from './id';
import { comparisonHistoryStorage } from './comparisonHistoryStorage';
import type { ListStorage } from './listStorage';

export function formatearDireccion(address?: Address): string | undefined {
  if (!address) return undefined;
  return address.descripcionSecundaria ? `${address.descripcion}, ${address.descripcionSecundaria}` : address.descripcion;
}

export function construirEntradaHistorial(resultado: ResultadoComparacion): ComparisonHistory {
  return {
    id: generateId(),
    fecha: resultado.generadoEn,
    origen: formatearDireccion(resultado.input.origen),
    destino: formatearDireccion(resultado.input.destino),
    distanciaKm: resultado.input.distanciaKm,
    resultadosPorModo: resultado.opciones
      .filter((o) => o.disponible)
      .map((o) => ({ modo: o.modo, costoTotal: o.costoTotal, costoPorPersona: o.costoPorPersona })),
    opcionGanadora: resultado.opcionRecomendada?.modo ?? '',
  };
}

/** Se llama una vez por cada comparación calculada (ver hooks/useComparador.ts). */
export async function registrarComparacion(
  resultado: ResultadoComparacion,
  storage: ListStorage<ComparisonHistory> = comparisonHistoryStorage
): Promise<ComparisonHistory> {
  const entrada = construirEntradaHistorial(resultado);
  await storage.add(entrada);
  return entrada;
}
