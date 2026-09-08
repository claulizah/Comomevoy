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

function mismoMes(fechaISO: string, ahora: Date): boolean {
  const fecha = new Date(fechaISO);
  return fecha.getFullYear() === ahora.getFullYear() && fecha.getMonth() === ahora.getMonth();
}

export function calcularAhorro(entry: ComparisonHistory): number {
  if (entry.opcionGanadora === 'auto') return 0;
  const ganadora = entry.resultadosPorModo.find((r) => r.modo === entry.opcionGanadora);
  const auto = entry.resultadosPorModo.find((r) => r.modo === 'auto');
  if (!ganadora || !auto) return 0;
  return Math.max(0, auto.costoTotal - ganadora.costoTotal);
}

/** Costo real gastado en una comparación: el de la opción que se eligió (la ganadora), no el ahorro. */
export function calcularGastoOpcionGanadora(entry: ComparisonHistory): number {
  const ganadora = entry.resultadosPorModo.find((r) => r.modo === entry.opcionGanadora);
  return ganadora?.costoTotal ?? 0;
}

/** Suma del gasto (opción ganadora) de todas las comparaciones del mes en curso — usado por PresupuestoMensual. */
export function calcularGastoDelMes(historial: ComparisonHistory[], ahora: Date = new Date()): number {
  return historial.filter((entry) => mismoMes(entry.fecha, ahora)).reduce((acc, entry) => acc + calcularGastoOpcionGanadora(entry), 0);
}

export interface EvaluacionPresupuesto {
  gastoDelMes: number;
  monto: number;
  restante: number;
  rebasado: boolean;
  /** 0-100, tope en 100 aunque el gasto rebase el presupuesto (para barras de progreso). */
  porcentaje: number;
}

/** Gasto del mes contra el presupuesto definido — usado por PresupuestoMensual. */
export function evaluarPresupuesto(historial: ComparisonHistory[], monto: number, ahora: Date = new Date()): EvaluacionPresupuesto {
  const gastoDelMes = calcularGastoDelMes(historial, ahora);
  return {
    gastoDelMes,
    monto,
    restante: monto - gastoDelMes,
    rebasado: monto > 0 && gastoDelMes > monto,
    porcentaje: monto > 0 ? Math.min(100, (gastoDelMes / monto) * 100) : 0,
  };
}

export function calcularEstadisticas(historial: ComparisonHistory[], ahora: Date = new Date()): EstadisticasHistorial {
  if (historial.length === 0) return ESTADISTICAS_VACIAS;

  const ahorroDelMes = historial.filter((entry) => mismoMes(entry.fecha, ahora)).reduce((acc, entry) => acc + calcularAhorro(entry), 0);

  const ahorroTotal = historial.reduce((acc, entry) => acc + calcularAhorro(entry), 0);
  const promedioAhorroPorComparacion = ahorroTotal / historial.length;

  const primeraFechaMs = Math.min(...historial.map((entry) => new Date(entry.fecha).getTime()));
  const diasTranscurridos = Math.max(1, (ahora.getTime() - primeraFechaMs) / (24 * 60 * 60 * 1000));
  const comparacionesPorSemana = historial.length / (diasTranscurridos / 7);

  const proyeccionAnual = promedioAhorroPorComparacion * comparacionesPorSemana * 52;

  return { ahorroDelMes, promedioAhorroPorComparacion, comparacionesPorSemana, proyeccionAnual };
}
