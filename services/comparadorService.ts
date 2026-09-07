import { TRANSPORT_MODE_META } from '../constants/transportModes';
import type { OpcionTransporte, ResultadoComparacion, TrayectoInput } from '../types/comparador';
import type { RatesConfig } from '../types/rates';
import { formatCurrencyMXN } from './formatters';

/**
 * Motor de comparación de costos de trayecto.
 *
 * NOTA: la especificación técnica del proyecto (secciones 2, 6 y 7) no
 * estuvo disponible al construir este módulo. Las fórmulas, umbrales y
 * "casos límite" de abajo son supuestos razonables para un contexto
 * mexicano, documentados en línea y aislados en `ratesService.ts` para
 * poder ajustarlos (o sustituirlos por la lógica real de la spec) sin
 * tocar las pantallas.
 */

const MULTIPLICADOR_VUELTA = (idaYVuelta: boolean) => (idaYVuelta ? 2 : 1);

function pasajerosValidos(numPasajeros: number): number {
  return Math.max(1, Math.round(numPasajeros));
}

function velocidadAuto(distanciaKm: number, umbralUrbanoKm: number, urbana: number, carretera: number): number {
  return distanciaKm <= umbralUrbanoKm ? urbana : carretera;
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
  calculo: CalculoBase | null,
  motivoNoDisponible?: string
): OpcionTransporte {
  return {
    modo,
    nombre: TRANSPORT_MODE_META[modo].nombre,
    disponible,
    motivoNoDisponible: disponible ? undefined : motivoNoDisponible,
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
  const costoCombustible = (distanciaTotal / r.auto.rendimientoKmPorLitro) * r.auto.precioLitroGasolina;
  const costoMantenimiento = distanciaTotal * r.auto.costoMantenimientoPorKm;
  const costoTotal = costoCombustible + costoMantenimiento;
  const velocidad = velocidadAuto(distanciaKm, r.auto.umbralUrbanoKm, r.auto.velocidadUrbanaKmH, r.auto.velocidadCarreteraKmH);
  const tiempoEstimadoMin = (distanciaTotal / velocidad) * 60;
  const co2Kg = distanciaTotal * r.auto.co2KgPorKm;
  const pax = pasajerosValidos(numPasajeros);

  return construirOpcion('auto', true, {
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
  const costoUnaVia = (r.uberDidi.tarifaBase + r.uberDidi.costoPorKm * distanciaKm + r.uberDidi.costoPorMinuto * tiempoUnaViaMin) * factor;
  const costoTotal = costoUnaVia * vueltas;
  const tiempoEstimadoMin = (tiempoUnaViaMin + r.uberDidi.tiempoEsperaMin) * vueltas;
  const co2Kg = distanciaKm * vueltas * r.uberDidi.co2KgPorKm;
  const pax = pasajerosValidos(numPasajeros);

  return construirOpcion('uber_didi', true, {
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
  r: RatesConfig
): OpcionTransporte {
  if (distanciaKm > r.transportePublico.distanciaMaximaKm) {
    return construirOpcion(
      'transporte_publico',
      false,
      null,
      `No disponible para trayectos mayores a ${r.transportePublico.distanciaMaximaKm} km.`
    );
  }

  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const pax = pasajerosValidos(numPasajeros);
  const costoPorPersona = r.transportePublico.tarifaPorViaje * vueltas;
  const costoTotal = costoPorPersona * pax;
  const tiempoEstimadoMin = ((distanciaKm / r.transportePublico.velocidadEfectivaKmH) * 60 + r.transportePublico.tiempoEsperaTransbordoMin) * vueltas;
  const co2Kg = r.transportePublico.co2KgPorPasajeroKm * distanciaKm * vueltas * pax;

  return construirOpcion('transporte_publico', true, { costoTotal, costoPorPersona, tiempoEstimadoMin, co2Kg });
}

function calcularBlaBlaCar(distanciaKm: number, idaYVuelta: boolean, numPasajeros: number, r: RatesConfig): OpcionTransporte {
  if (distanciaKm < r.blablacar.distanciaMinimaKm) {
    return construirOpcion(
      'blablacar',
      false,
      null,
      `No suele haber viajes compartidos para trayectos menores a ${r.blablacar.distanciaMinimaKm} km.`
    );
  }

  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const pax = pasajerosValidos(numPasajeros);
  const costoPorPersona = r.blablacar.costoPorKmPorPasajero * distanciaKm * vueltas;
  const costoTotal = costoPorPersona * pax;
  const tiempoEstimadoMin = ((distanciaKm / r.blablacar.velocidadCarreteraKmH) * 60 + r.blablacar.tiempoEsperaCoordinacionMin) * vueltas;
  const co2Kg = r.blablacar.co2KgPorPasajeroKm * distanciaKm * vueltas * pax;

  return construirOpcion('blablacar', true, { costoTotal, costoPorPersona, tiempoEstimadoMin, co2Kg });
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

  return construirOpcion('autobus_foraneo', true, { costoTotal, costoPorPersona, tiempoEstimadoMin, co2Kg });
}

function calcularAvion(distanciaKm: number, idaYVuelta: boolean, numPasajeros: number, r: RatesConfig): OpcionTransporte {
  const distanciaMinima = Math.max(r.umbrales.distanciaMinLargaDistanciaKm, r.avion.distanciaMinimaKm);
  if (distanciaKm < distanciaMinima) {
    return construirOpcion('avion', false, null, `Solo se muestra para trayectos de ${distanciaMinima} km o más.`);
  }

  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const pax = pasajerosValidos(numPasajeros);
  const tarifaUnaVia = r.avion.costoBasePorPasajero + r.avion.costoPorKmPorPasajero * distanciaKm;
  const costoPorPersona = tarifaUnaVia * vueltas;
  const costoTotal = costoPorPersona * pax;
  const tiempoEstimadoMin = ((distanciaKm / r.avion.velocidadCruceroKmH) * 60 + r.avion.tiempoOverheadAeropuertoMin) * vueltas;
  const co2Kg = r.avion.co2KgPorPasajeroKm * distanciaKm * vueltas * pax;

  return construirOpcion('avion', true, { costoTotal, costoPorPersona, tiempoEstimadoMin, co2Kg });
}

function calcularMoto(distanciaKm: number, idaYVuelta: boolean, numPasajeros: number, r: RatesConfig): OpcionTransporte {
  if (numPasajeros > r.moto.capacidadMaxPasajeros) {
    return construirOpcion('moto', false, null, `No aplica para más de ${r.moto.capacidadMaxPasajeros} pasajeros.`);
  }
  if (distanciaKm > r.moto.distanciaMaximaKm) {
    return construirOpcion('moto', false, null, `No recomendable para trayectos mayores a ${r.moto.distanciaMaximaKm} km.`);
  }

  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const distanciaTotal = distanciaKm * vueltas;
  const costoCombustible = (distanciaTotal / r.moto.rendimientoKmPorLitro) * r.moto.precioLitroGasolina;
  const costoMantenimiento = distanciaTotal * r.moto.costoMantenimientoPorKm;
  const costoTotal = costoCombustible + costoMantenimiento;
  const velocidad = velocidadAuto(distanciaKm, r.moto.umbralUrbanoKm, r.moto.velocidadUrbanaKmH, r.moto.velocidadCarreteraKmH);
  const tiempoEstimadoMin = (distanciaTotal / velocidad) * 60;
  const co2Kg = distanciaTotal * r.moto.co2KgPorKm;
  const pax = pasajerosValidos(numPasajeros);

  return construirOpcion('moto', true, {
    costoTotal,
    costoPorPersona: costoTotal / pax,
    tiempoEstimadoMin,
    co2Kg,
  });
}

function calcularCaminar(distanciaKm: number, idaYVuelta: boolean, r: RatesConfig): OpcionTransporte {
  if (distanciaKm <= 0 || distanciaKm > r.umbrales.distanciaMaxCaminarKm) {
    return construirOpcion('caminar', false, null, `Solo se sugiere para trayectos de hasta ${r.umbrales.distanciaMaxCaminarKm} km.`);
  }
  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const tiempoEstimadoMin = ((distanciaKm * vueltas) / r.activos.velocidadCaminarKmH) * 60;

  return construirOpcion('caminar', true, { costoTotal: 0, costoPorPersona: 0, tiempoEstimadoMin, co2Kg: 0 });
}

function calcularBicicleta(distanciaKm: number, idaYVuelta: boolean, r: RatesConfig): OpcionTransporte {
  if (distanciaKm <= 0 || distanciaKm > r.umbrales.distanciaMaxBiciKm) {
    return construirOpcion('bicicleta', false, null, `Solo se sugiere para trayectos de hasta ${r.umbrales.distanciaMaxBiciKm} km.`);
  }
  const vueltas = MULTIPLICADOR_VUELTA(idaYVuelta);
  const tiempoEstimadoMin = ((distanciaKm * vueltas) / r.activos.velocidadBiciKmH) * 60;

  return construirOpcion('bicicleta', true, { costoTotal: 0, costoPorPersona: 0, tiempoEstimadoMin, co2Kg: 0 });
}

function generarMensajeDestacado(opciones: OpcionTransporte[]): string | undefined {
  const disponibles = opciones.filter((o) => o.disponible);
  if (disponibles.length === 0) return undefined;

  const masBarata = disponibles.reduce((min, o) => (o.costoPorPersona < min.costoPorPersona ? o : min));
  const auto = disponibles.find((o) => o.modo === 'auto');

  if (masBarata.modo === 'auto') {
    return 'Tu auto es la opción más económica para este trayecto.';
  }

  if (auto) {
    const ahorro = auto.costoPorPersona - masBarata.costoPorPersona;
    if (ahorro > 0) {
      return `Te conviene más ${masBarata.nombre} — ahorras ${formatCurrencyMXN(ahorro)} por persona frente a tu auto.`;
    }
  }

  return `${masBarata.nombre} es la opción más económica para este trayecto.`;
}

export function compararTrayecto(input: TrayectoInput, rates: RatesConfig): ResultadoComparacion {
  const { distanciaKm, idaYVuelta, numPasajeros } = input;

  const opciones: OpcionTransporte[] = [
    calcularAuto(distanciaKm, idaYVuelta, numPasajeros, rates),
    calcularUberDidi(distanciaKm, idaYVuelta, numPasajeros, rates),
    calcularTransportePublico(distanciaKm, idaYVuelta, numPasajeros, rates),
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
