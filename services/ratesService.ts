import type { CitySettings, MotoProfile, VehicleProfile } from '../types/models';
import type { RatesConfig } from '../types/rates';

/**
 * Perfil de auto/moto y tarifas de ciudad por defecto. Son valores de
 * referencia razonables para México (no vienen de la especificación
 * técnica, que no da cifras concretas) y están pensados para ajustarse
 * fácilmente: ninguna pantalla ni función de cálculo depende de estos
 * números directamente, todas pasan por `ratesService.getRates()`.
 *
 * Cuando exista la pantalla "Perfil de auto" (con persistencia en
 * AsyncStorage, siguiente prompt) estos defaults se reemplazan por el
 * VehicleProfile/MotoProfile real de la usuaria; cuando exista selección
 * de ciudad, por el CitySettings real.
 */
export const defaultVehicleProfile: VehicleProfile = {
  id: 'default',
  rendimientoKmPorLitro: 12,
  precioGasolinaPorLitro: 24.5,
  seguroMensual: 1200,
  mantenimientoMensual: 600,
  depreciacionPorKm: 0.8,
};

export const defaultMotoProfile: MotoProfile = {
  id: 'default',
  rendimientoKmPorLitro: 35,
  precioGasolinaPorLitro: 24.5,
  seguroMensual: 400,
  mantenimientoMensual: 250,
  depreciacionPorKm: 0.3,
};

export const defaultCitySettings: CitySettings = {
  ciudad: 'Ciudad de México',
  tarifaUberDidi: 6.5,
  tarifaTransportePublico: 12,
  tarifaBlaBlaCar: 1.6,
};

export const defaultRatesMexico: RatesConfig = {
  moneda: 'MXN',
  actualizadoEn: '2026-01-01T00:00:00.000Z',
  kmMensualesReferencia: 1200,
  auto: {
    ...defaultVehicleProfile,
    velocidadUrbanaKmH: 30,
    velocidadCarreteraKmH: 90,
    umbralUrbanoKm: 15,
    co2KgPorKm: 0.171,
  },
  uberDidi: {
    tarifaUberDidi: defaultCitySettings.tarifaUberDidi,
    tarifaBase: 25,
    costoPorMinuto: 1.8,
    factorTraficoUrbano: 1.15,
    tiempoEsperaMin: 8,
    co2KgPorKm: 0.18,
  },
  transportePublico: {
    tarifaTransportePublico: defaultCitySettings.tarifaTransportePublico,
    velocidadEfectivaKmH: 20,
    tiempoEsperaTransbordoMin: 15,
    distanciaMaximaKm: 60,
    co2KgPorPasajeroKm: 0.04,
  },
  blablacar: {
    tarifaBlaBlaCar: defaultCitySettings.tarifaBlaBlaCar,
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
    ...defaultMotoProfile,
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
