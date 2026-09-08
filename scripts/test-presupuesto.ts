/**
 * Prueba manual (sin Jest/RN) del cálculo de gasto del mes contra el
 * presupuesto. Corre con: npm run test:presupuesto
 *
 * Mismo espíritu que scripts/test-motor-comparacion.ts y
 * scripts/test-ruta-frecuente.ts: historial fake armado a mano, sin
 * AsyncStorage ni RN, probando la lógica real de
 * services/historyStatsService.ts.
 */
import { calcularGastoDelMes, evaluarPresupuesto } from '../services/historyStatsService';
import { generateId } from '../services/id';
import type { ComparisonHistory } from '../types/models';

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

// Fecha de referencia fija (no Date.now()) para que la prueba no dependa
// de qué día del mes se ejecute — construir fechas con "hace N días" desde
// hoy puede cruzar el límite de mes según cuándo se corra.
const AHORA = new Date(2026, 8, 15); // 15 de septiembre de 2026

function enEsteMes(dia: number): string {
  return new Date(AHORA.getFullYear(), AHORA.getMonth(), dia).toISOString();
}

function enMesAnterior(dia: number): string {
  return new Date(AHORA.getFullYear(), AHORA.getMonth() - 1, dia).toISOString();
}

function entradaHistorial(fecha: string, opcionGanadora: string, resultadosPorModo: ComparisonHistory['resultadosPorModo']): ComparisonHistory {
  return {
    id: generateId(),
    fecha,
    distanciaKm: 20,
    resultadosPorModo,
    opcionGanadora,
  };
}

async function main() {
  // Tres comparaciones este mes, con el transporte público como ganador ($30, $25, $40),
  // más una comparación del mes anterior (no debe contar) y una donde ganó el auto ($150).
  const historial: ComparisonHistory[] = [
    entradaHistorial(enEsteMes(14), 'transporte_publico', [
      { modo: 'auto', costoTotal: 120, costoPorPersona: 120 },
      { modo: 'transporte_publico', costoTotal: 30, costoPorPersona: 30 },
    ]),
    entradaHistorial(enEsteMes(10), 'transporte_publico', [
      { modo: 'auto', costoTotal: 110, costoPorPersona: 110 },
      { modo: 'transporte_publico', costoTotal: 25, costoPorPersona: 25 },
    ]),
    entradaHistorial(enMesAnterior(20), 'transporte_publico', [
      { modo: 'auto', costoTotal: 130, costoPorPersona: 130 },
      { modo: 'transporte_publico', costoTotal: 40, costoPorPersona: 40 },
    ]),
    entradaHistorial(enEsteMes(13), 'auto', [
      { modo: 'auto', costoTotal: 150, costoPorPersona: 150 },
      { modo: 'transporte_publico', costoTotal: 35, costoPorPersona: 35 },
    ]),
    entradaHistorial(enMesAnterior(3), 'transporte_publico', [
      { modo: 'auto', costoTotal: 100, costoPorPersona: 100 },
      { modo: 'transporte_publico', costoTotal: 20, costoPorPersona: 20 },
    ]),
  ];

  // Gasto del mes = costo de la opción GANADORA de cada comparación de ESTE mes,
  // no el ahorro: 30 + 25 + 150 = 205. Las dos del mes anterior no cuentan.
  const gastoDelMes = calcularGastoDelMes(historial, AHORA);
  assertEqual(gastoDelMes, 205, 'Suma el costo de la opción ganadora de cada comparación del mes en curso');

  // --- Presupuesto amplio: no se rebasa ---
  const dentroDePresupuesto = evaluarPresupuesto(historial, 300, AHORA);
  assertEqual(dentroDePresupuesto.gastoDelMes, 205, 'evaluarPresupuesto reporta el mismo gasto del mes');
  assertEqual(dentroDePresupuesto.restante, 95, 'Con presupuesto de 300 y gasto de 205, quedan 95');
  assert(!dentroDePresupuesto.rebasado, 'Con gasto menor al presupuesto, no está rebasado');
  assertEqual(Math.round(dentroDePresupuesto.porcentaje), 68, 'Porcentaje usado ~68% (205/300)');

  // --- Presupuesto ajustado: se rebasa ---
  const rebasado = evaluarPresupuesto(historial, 150, AHORA);
  assert(rebasado.rebasado, 'Con gasto (205) mayor al presupuesto (150), está rebasado');
  assertEqual(rebasado.restante, -55, 'El restante es negativo cuando se rebasa');
  assertEqual(rebasado.porcentaje, 100, 'El porcentaje se limita a 100 aunque se rebase (para la barra de progreso)');

  // --- Sin presupuesto definido (monto 0): nunca "rebasado", no divide entre cero ---
  const sinPresupuesto = evaluarPresupuesto(historial, 0, AHORA);
  assert(!sinPresupuesto.rebasado, 'Sin presupuesto definido (monto=0), nunca se marca como rebasado');
  assertEqual(sinPresupuesto.porcentaje, 0, 'Sin presupuesto definido, el porcentaje es 0 (no NaN/Infinity)');

  // --- Historial vacío ---
  const vacio = evaluarPresupuesto([], 500, AHORA);
  assertEqual(vacio.gastoDelMes, 0, 'Con historial vacío, el gasto del mes es 0');
  assert(!vacio.rebasado, 'Con historial vacío, nunca está rebasado');

  console.log(fallas === 0 ? '\nTodo bien.' : `\n${fallas} prueba(s) fallaron.`);
  process.exit(fallas === 0 ? 0 : 1);
}

main();
