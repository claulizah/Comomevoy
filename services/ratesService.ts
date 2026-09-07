import type { RatesConfig } from '../types/rates';

/**
 * Tarifas por defecto para México. Son valores de referencia razonables
 * (no vienen de la especificación técnica, que no estuvo disponible al
 * construir este módulo) y están pensados para ajustarse fácilmente:
 * ninguna pantalla ni función de cálculo depende de estos números
 * directamente, todas pasan por `ratesService.getRates()`.
 *
 * Siguiente paso natural: sustituir `LocalRatesProvider` por un
 * `RemoteRatesProvider` que lea un config remoto (p. ej. servido por el
 * mismo backend/proxy que Google Maps) y, para gasolina, por el API
 * abierto de precios de la CRE.
 */
export const defaultRatesMexico: RatesConfig = {
  moneda: 'MXN',
  actualizadoEn: '2026-01-01T00:00:00.000Z',
  auto: {
    precioLitroGasolina: 24.5,
    rendimientoKmPorLitro: 12,
    costoMantenimientoPorKm: 1.5,
    velocidadUrbanaKmH: 30,
    velocidadCarreteraKmH: 90,
    umbralUrbanoKm: 15,
    co2KgPorKm: 0.171,
  },
  uberDidi: {
    tarifaBase: 25,
    costoPorKm: 6.5,
    costoPorMinuto: 1.8,
    factorTraficoUrbano: 1.15,
    tiempoEsperaMin: 8,
    co2KgPorKm: 0.18,
  },
  transportePublico: {
    tarifaPorViaje: 12,
    velocidadEfectivaKmH: 20,
    tiempoEsperaTransbordoMin: 15,
    distanciaMaximaKm: 60,
    co2KgPorPasajeroKm: 0.04,
  },
  blablacar: {
    costoPorKmPorPasajero: 1.6,
    velocidadCarreteraKmH: 90,
    tiempoEsperaCoordinacionMin: 20,
    distanciaMinimaKm: 20,
    co2KgPorPasajeroKm: 0.045,
  },
  autobusForaneo: {
    costoPorKmPorPasajero: 1.9,
    tarifaMinima: 150,
    velocidadPromedioKmH: 70,
    tiempoAnticipacionTerminalMin: 45,
    co2KgPorPasajeroKm: 0.03,
  },
  avion: {
    costoBasePorPasajero: 900,
    costoPorKmPorPasajero: 2.1,
    velocidadCruceroKmH: 750,
    tiempoOverheadAeropuertoMin: 150,
    distanciaMinimaKm: 400,
    co2KgPorPasajeroKm: 0.15,
  },
  moto: {
    precioLitroGasolina: 24.5,
    rendimientoKmPorLitro: 35,
    costoMantenimientoPorKm: 0.8,
    velocidadUrbanaKmH: 35,
    velocidadCarreteraKmH: 95,
    umbralUrbanoKm: 15,
    capacidadMaxPasajeros: 2,
    distanciaMaximaKm: 300,
    co2KgPorKm: 0.09,
  },
  activos: {
    velocidadCaminarKmH: 4.5,
    velocidadBiciKmH: 15,
  },
  umbrales: {
    distanciaMaxCaminarKm: 2,
    distanciaMaxBiciKm: 8,
    distanciaMinLargaDistanciaKm: 150,
  },
};

export interface RatesProvider {
  getRates(): Promise<RatesConfig>;
}

class LocalRatesProvider implements RatesProvider {
  async getRates(): Promise<RatesConfig> {
    return defaultRatesMexico;
  }
}

export const ratesService: RatesProvider = new LocalRatesProvider();
