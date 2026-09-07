import { TRANSPORT_MODE_META } from '../constants/transportModes';
import type { Address, OpcionTransporte, ResultadoComparacion, TrayectoInput } from '../types/comparador';
import type { RatesConfig } from '../types/rates';
import { formatCurrencyMXN } from './formatters';
import { hayRutaRealTransportePublico } from './transitRouteService';

/**
 * Motor de comparación de costos de trayecto (sección 2 de la
 * especificación técnica).
 *
 * Los umbrales y tarifas exactas no vienen dados por la spec (que no fija
 * cifras) y son supuestos razonables para México, documentados en línea y
 * aislados en `ratesService.ts` para poder ajustarlos sin tocar pantallas.
 *
 * "Casos límite" aplicados literalmente de la sección 2:
 * - Transporte público: si no hay una ruta real (ver transitRouteService.ts)
 *   la opción no se muestra como disponible; no se fuerza un estimado.
 * - BlaBlaCar y autobús foráneo no tienen API en vivo aquí, así que se
 *   marcan `esEstimado: true`. Extiendo el mismo criterio a avión, que
 *   está en la misma situación (sin API de precios conectada), aunque el
 *   texto de la spec solo nombra a los primeros dos explícitamente.
 */

const MULTIPLICADOR_VUELTA = (idaYVuelta: boolean) => (idaYVuelta ? 2 : 1);

function pasajerosValidos(numPasajeros: number): number {
  return Math.max(1, Math.round(numPasajeros));
}

function velocidadAuto(distanciaKm: number, umbralUrbanoKm: number, urbana: number, carretera: number): number {
  return distanciaKm <= umbralUrbanoKm ? urbana : carretera;
}

/** Amortiza seguro + mantenimiento mensual a un costo por km, usando un kilometraje mensual de referencia. */
function costoFijoPorKm(seguroMensual: number, mantenimientoMensual: number, depreciacionPorKm: number, kmMensualesReferencia: number): number {
  return (seguroMensual + mantenimientoMensual) / kmMensualesReferencia + depreciacionPorKm;
}

interface CalculoBase {
  costoTotal: number;
  costoPorPersona: number;
  tiempoEstimadoMin: number;
  co2Kg: number;
}

function construirOpcion(
  modo: OpcionTransporte['modo'],
  disponible: boolean,
  esEstimado: boolean,
  calculo: CalculoBase | null,
  motivoNoDisponible?: string
): OpcionTransporte {
  return {
    modo,
    nombre: TRANSPORT_MODE_META[modo].nombre,
    disponible,
    motivoNoDisponible: disponible ? undefined : motivoNoDisponible,
    esEstimado: disponible && esEstimado,
    costoTotal: calculo?.costoTotal ?? 0,
    costoPorPersona: calculo?.costoPorPersona ?? 0,
    tiempoEstimadoMin: calculo?.tiempoEstimadoMin ?? 0,
    co2Kg: calculo?.co2Kg ?? 0,
    esRecomendada: false,
  };
}

function calcularAuto(distanciaKm: number, idaYVuelta: boolean, numPasajeros: number, r: RatesConfig): OpcionTransporte {
  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const distanciaTotal = distanciaKm * vueltas;
  const costoCombustible = (distanciaTotal / r.auto.rendimientoKmPorLitro) * r.auto.precioGasolinaPorLitro;
  const costoFijo = costoFijoPorKm(r.auto.seguroMensual, r.auto.mantenimientoMensual, r.auto.depreciacionPorKm, r.kmMensualesReferencia);
  const costoTotal = costoCombustible + distanciaTotal * costoFijo;
  const velocidad = velocidadAuto(distanciaKm, r.auto.umbralUrbanoKm, r.auto.velocidadUrbanaKmH, r.auto.velocidadCarreteraKmH);
  const tiempoEstimadoMin = (distanciaTotal / velocidad) * 60;
  const co2Kg = distanciaTotal * r.auto.co2KgPorKm;
  const pax = pasajerosValidos(numPasajeros);

  return construirOpcion('auto', true, false, {
    costoTotal,
    costoPorPersona: costoTotal / pax,
    tiempoEstimadoMin,
    co2Kg,
  });
}

function calcularUberDidi(distanciaKm: number, idaYVuelta: boolean, numPasajeros: number, r: RatesConfig): OpcionTransporte {
  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const velocidad = velocidadAuto(distanciaKm, r.auto.umbralUrbanoKm, r.auto.velocidadUrbanaKmH, r.auto.velocidadCarreteraKmH);
  const tiempoUnaViaMin = (distanciaKm / velocidad) * 60;
  const enTrafico = distanciaKm <= r.auto.umbralUrbanoKm;
  const factor = enTrafico ? r.uberDidi.factorTraficoUrbano : 1;
  const costoUnaVia = (r.uberDidi.tarifaBase + r.uberDidi.tarifaUberDidi * distanciaKm + r.uberDidi.costoPorMinuto * tiempoUnaViaMin) * factor;
  const costoTotal = costoUnaVia * vueltas;
  const tiempoEstimadoMin = (tiempoUnaViaMin + r.uberDidi.tiempoEsperaMin) * vueltas;
  const co2Kg = distanciaKm * vueltas * r.uberDidi.co2KgPorKm;
  const pax = pasajerosValidos(numPasajeros);

  return construirOpcion('uber_didi', true, false, {
    costoTotal,
    costoPorPersona: costoTotal / pax,
    tiempoEstimadoMin,
    co2Kg,
  });
}

function calcularTransportePublico(
  distanciaKm: number,
  idaYVuelta: boolean,
  numPasajeros: number,
  r: RatesConfig,
  origen: Address | undefined,
  destino: Address | undefined
): OpcionTransporte {
  if (!hayRutaRealTransportePublico(origen, destino)) {
    return construirOpcion(
      'transporte_publico',
      false,
      false,
      null,
      'No se encontró una ruta real de transporte público entre estos puntos.'
    );
  }
  if (distanciaKm > r.transportePublico.distanciaMaximaKm) {
    return construirOpcion(
      'transporte_publico',
      false,
      false,
      null,
      `No disponible para trayectos mayores a ${r.transportePublico.distanciaMaximaKm} km.`
    );
  }

  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const pax = pasajerosValidos(numPasajeros);
  const costoPorPersona = r.transportePublico.tarifaTransportePublico * vueltas;
  const costoTotal = costoPorPersona * pax;
  const tiempoEstimadoMin = ((distanciaKm / r.transportePublico.velocidadEfectivaKmH) * 60 + r.transportePublico.tiempoEsperaTransbordoMin) * vueltas;
  const co2Kg = r.transportePublico.co2KgPorPasajeroKm * distanciaKm * vueltas * pax;

  return construirOpcion('transporte_publico', true, false, { costoTotal, costoPorPersona, tiempoEstimadoMin, co2Kg });
}

function calcularBlaBlaCar(distanciaKm: number, idaYVuelta: boolean, numPasajeros: number, r: RatesConfig): OpcionTransporte {
  if (distanciaKm < r.blablacar.distanciaMinimaKm) {
    return construirOpcion(
      'blablacar',
      false,
      true,
      null,
      `No suele haber viajes compartidos para trayectos menores a ${r.blablacar.distanciaMinimaKm} km.`
    );
  }

  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const pax = pasajerosValidos(numPasajeros);
  const costoPorPersona = r.blablacar.tarifaBlaBlaCar * distanciaKm * vueltas;
  const costoTotal = costoPorPersona * pax;
  const tiempoEstimadoMin = ((distanciaKm / r.blablacar.velocidadCarreteraKmH) * 60 + r.blablacar.tiempoEsperaCoordinacionMin) * vueltas;
  const co2Kg = r.blablacar.co2KgPorPasajeroKm * distanciaKm * vueltas * pax;

  return construirOpcion('blablacar', true, true, { costoTotal, costoPorPersona, tiempoEstimadoMin, co2Kg });
}

function calcularAutobusForaneo(
  distanciaKm: number,
  idaYVuelta: boolean,
  numPasajeros: number,
  r: RatesConfig
): OpcionTransporte {
  if (distanciaKm < r.umbrales.distanciaMinLargaDistanciaKm) {
    return construirOpcion(
      'autobus_foraneo',
      false,
      true,
      null,
      `Solo se muestra para trayectos de ${r.umbrales.distanciaMinLargaDistanciaKm} km o más.`
    );
  }

  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const pax = pasajerosValidos(numPasajeros);
  const tarifaUnaVia = Math.max(r.autobusForaneo.costoPorKmPorPasajero * distanciaKm, r.autobusForaneo.tarifaMinima);
  const costoPorPersona = tarifaUnaVia * vueltas;
  const costoTotal = costoPorPersona * pax;
  const tiempoEstimadoMin = ((distanciaKm / r.autobusForaneo.velocidadPromedioKmH) * 60 + r.autobusForaneo.tiempoAnticipacionTerminalMin) * vueltas;
  const co2Kg = r.autobusForaneo.co2KgPorPasajeroKm * distanciaKm * vueltas * pax;

  return construirOpcion('autobus_foraneo', true, true, { costoTotal, costoPorPersona, tiempoEstimadoMin, co2Kg });
}

function calcularAvion(distanciaKm: number, idaYVuelta: boolean, numPasajeros: number, r: RatesConfig): OpcionTransporte {
  const distanciaMinima = Math.max(r.umbrales.distanciaMinLargaDistanciaKm, r.avion.distanciaMinimaKm);
  if (distanciaKm < distanciaMinima) {
    return construirOpcion('avion', false, true, null, `Solo se muestra para trayectos de ${distanciaMinima} km o más.`);
  }

  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const pax = pasajerosValidos(numPasajeros);
  const tarifaUnaVia = r.avion.costoBasePorPasajero + r.avion.costoPorKmPorPasajero * distanciaKm;
  const costoPorPersona = tarifaUnaVia * vueltas;
  const costoTotal = costoPorPersona * pax;
  const tiempoEstimadoMin = ((distanciaKm / r.avion.velocidadCruceroKmH) * 60 + r.avion.tiempoOverheadAeropuertoMin) * vueltas;
  const co2Kg = r.avion.co2KgPorPasajeroKm * distanciaKm * vueltas * pax;

  return construirOpcion('avion', true, true, { costoTotal, costoPorPersona, tiempoEstimadoMin, co2Kg });
}

function calcularMoto(distanciaKm: number, idaYVuelta: boolean, numPasajeros: number, r: RatesConfig): OpcionTransporte {
  if (numPasajeros > r.moto.capacidadMaxPasajeros) {
    return construirOpcion('moto', false, false, null, `No aplica para más de ${r.moto.capacidadMaxPasajeros} pasajeros.`);
  }
  if (distanciaKm > r.moto.distanciaMaximaKm) {
    return construirOpcion('moto', false, false, null, `No recomendable para trayectos mayores a ${r.moto.distanciaMaximaKm} km.`);
  }

  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const distanciaTotal = distanciaKm * vueltas;
  const costoCombustible = (distanciaTotal / r.moto.rendimientoKmPorLitro) * r.moto.precioGasolinaPorLitro;
  const costoFijo = costoFijoPorKm(r.moto.seguroMensual, r.moto.mantenimientoMensual, r.moto.depreciacionPorKm, r.kmMensualesReferencia);
  const costoTotal = costoCombustible + distanciaTotal * costoFijo;
  const velocidad = velocidadAuto(distanciaKm, r.moto.umbralUrbanoKm, r.moto.velocidadUrbanaKmH, r.moto.velocidadCarreteraKmH);
  const tiempoEstimadoMin = (distanciaTotal / velocidad) * 60;
  const co2Kg = distanciaTotal * r.moto.co2KgPorKm;
  const pax = pasajerosValidos(numPasajeros);

  return construirOpcion('moto', true, false, {
    costoTotal,
    costoPorPersona: costoTotal / pax,
    tiempoEstimadoMin,
    co2Kg,
  });
}

function calcularCaminar(distanciaKm: number, idaYVuelta: boolean, r: RatesConfig): OpcionTransporte {
  if (distanciaKm <= 0 || distanciaKm > r.umbrales.distanciaMaxCaminarKm) {
    return construirOpcion('caminar', false, false, null, `Solo se sugiere para trayectos de hasta ${r.umbrales.distanciaMaxCaminarKm} km.`);
  }
  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const tiempoEstimadoMin = ((distanciaKm * vueltas) / r.activos.velocidadCaminarKmH) * 60;

  return construirOpcion('caminar', true, false, { costoTotal: 0, costoPorPersona: 0, tiempoEstimadoMin, co2Kg: 0 });
}

function calcularBicicleta(distanciaKm: number, idaYVuelta: boolean, r: RatesConfig): OpcionTransporte {
  if (distanciaKm <= 0 || distanciaKm > r.umbrales.distanciaMaxBiciKm) {
    return construirOpcion('bicicleta', false, false, null, `Solo se sugiere para trayectos de hasta ${r.umbrales.distanciaMaxBiciKm} km.`);
  }
  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const tiempoEstimadoMin = ((distanciaKm * vueltas) / r.activos.velocidadBiciKmH) * 60;

  return construirOpcion('bicicleta', true, false, { costoTotal: 0, costoPorPersona: 0, tiempoEstimadoMin, co2Kg: 0 });
}

/** Frase de ahorro: compara la opción más barata contra el auto y contra Uber/DiDi (ejemplo de la sección 2). */
function generarMensajeDestacado(opciones: OpcionTransporte[]): string | undefined {
  const disponibles = opciones.filter((o) => o.disponible);
  if (disponibles.length === 0) return undefined;

  const masBarata = disponibles.reduce((min, o) => (o.costoPorPersona < min.costoPorPersona ? o : min));

  if (masBarata.modo === 'auto') {
    return 'Tu auto es la opción más económica para este trayecto.';
  }

  const benchmarks: Array<{ modo: OpcionTransporte['modo']; etiqueta: string }> = [
    { modo: 'auto' as const, etiqueta: 'tu auto' },
    { modo: 'uber_didi' as const, etiqueta: 'Uber/DiDi' },
  ].filter((b) => b.modo !== masBarata.modo);

  const comparaciones: string[] = [];
  for (const benchmark of benchmarks) {
    const opcion = disponibles.find((o) => o.modo === benchmark.modo);
    if (!opcion) continue;
    const ahorro = opcion.costoPorPersona - masBarata.costoPorPersona;
    if (ahorro > 0) {
      comparaciones.push(`${formatCurrencyMXN(ahorro)} frente a ${benchmark.etiqueta}`);
    }
  }

  if (comparaciones.length === 0) {
    return `${masBarata.nombre} es la opción más económica para este trayecto.`;
  }

  return `Te conviene más ${masBarata.nombre} — ahorras ${comparaciones.join(' y ')}.`;
}

export function compararTrayecto(input: TrayectoInput, rates: RatesConfig): ResultadoComparacion {
  const { distanciaKm, idaYVuelta, numPasajeros, origen, destino } = input;

  const opciones: OpcionTransporte[] = [
    calcularAuto(distanciaKm, idaYVuelta, numPasajeros, rates),
    calcularUberDidi(distanciaKm, idaYVuelta, numPasajeros, rates),
    calcularTransportePublico(distanciaKm, idaYVuelta, numPasajeros, rates, origen, destino),
    calcularBlaBlaCar(distanciaKm, idaYVuelta, numPasajeros, rates),
    calcularAutobusForaneo(distanciaKm, idaYVuelta, numPasajeros, rates),
    calcularAvion(distanciaKm, idaYVuelta, numPasajeros, rates),
    calcularMoto(distanciaKm, idaYVuelta, numPasajeros, rates),
    calcularCaminar(distanciaKm, idaYVuelta, rates),
    calcularBicicleta(distanciaKm, idaYVuelta, rates),
  ];

  const disponibles = opciones.filter((o) => o.disponible).sort((a, b) => a.costoPorPersona - b.costoPorPersona);
  const mensajeDestacado = generarMensajeDestacado(opciones);

  let opcionRecomendada: OpcionTransporte | undefined;
  const opcionesFinales = opciones.map((opcion) => {
    if (disponibles.length > 0 && opcion.modo === disponibles[0].modo) {
      const marcada = { ...opcion, esRecomendada: true };
      opcionRecomendada = marcada;
      return marcada;
    }
    return opcion;
  });

  return {
    input,
    opciones: opcionesFinales,
    opcionRecomendada,
    mensajeDestacado,
    distanciaCaminable: distanciaKm > 0 && distanciaKm <= rates.umbrales.distanciaMaxCaminarKm,
    distanciaLargaDistancia: distanciaKm >= rates.umbrales.distanciaMinLargaDistanciaKm,
    generadoEn: new Date().toISOString(),
  };
}
