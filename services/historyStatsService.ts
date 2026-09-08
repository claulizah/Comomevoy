import type { ComparisonHistory } from '../types/models';

/**
 * Estadísticas del historial (pantalla "Historial"). "Ahorro" de una
 * comparación = costo de tu auto − costo de la opción ganadora (0 si la
 * ganadora fue el auto, o si no hay datos de auto/ganadora para esa
 * entrada).
 *
 * La "proyección anual" no viene definida por fórmula en la
 * especificación (solo "promedio de ahorro por comparación × frecuencia
 * de uso") así que documento el supuesto, igual que kmMensualesReferencia:
 * frecuencia de uso = comparaciones registradas por semana, calculada
 * sobre todo el historial (total de comparaciones ÷ semanas transcurridas
 * desde la primera comparación, mínimo 1 semana) × 52 semanas.
 */
export interface EstadisticasHistorial {
  ahorroDelMes: number;
  promedioAhorroPorComparacion: number;
  comparacionesPorSemana: number;
  proyeccionAnual: number;
}

const ESTADISTICAS_VACIAS: EstadisticasHistorial = {
  ahorroDelMes: 0,
  promedioAhorroPorComparacion: 0,
  comparacionesPorSemana: 0,
  proyeccionAnual: 0,
};

export function calcularAhorro(entry: ComparisonHistory): number {
  if (entry.opcionGanadora === 'auto') return 0;
  const ganadora = entry.resultadosPorModo.find((r) => r.modo === entry.opcionGanadora);
  const auto = entry.resultadosPorModo.find((r) => r.modo === 'auto');
  if (!ganadora || !auto) return 0;
  return Math.max(0, auto.costoTotal - ganadora.costoTotal);
}

export function calcularEstadisticas(historial: ComparisonHistory[], ahora: Date = new Date()): EstadisticasHistorial {
  if (historial.length === 0) return ESTADISTICAS_VACIAS;

  const ahorroDelMes = historial
    .filter((entry) => {
      const fecha = new Date(entry.fecha);
      return fecha.getFullYear() === ahora.getFullYear() && fecha.getMonth() === ahora.getMonth();
    })
    .reduce((acc, entry) => acc + calcularAhorro(entry), 0);

  const ahorroTotal = historial.reduce((acc, entry) => acc + calcularAhorro(entry), 0);
  const promedioAhorroPorComparacion = ahorroTotal / historial.length;

  const primeraFechaMs = Math.min(...historial.map((entry) => new Date(entry.fecha).getTime()));
  const diasTranscurridos = Math.max(1, (ahora.getTime() - primeraFechaMs) / (24 * 60 * 60 * 1000));
  const comparacionesPorSemana = historial.length / (diasTranscurridos / 7);

  const proyeccionAnual = promedioAhorroPorComparacion * comparacionesPorSemana * 52;

  return { ahorroDelMes, promedioAhorroPorComparacion, comparacionesPorSemana, proyeccionAnual };
}
