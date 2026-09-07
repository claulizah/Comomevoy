/**
 * Configuración de tarifas usadas por el Motor de comparación.
 * Ver services/ratesService.ts para los valores por defecto y cómo se
 * reemplazan por una fuente remota/variable (o por VehicleProfile/
 * MotoProfile/CitySettings reales) más adelante.
 */
import type { CitySettings, MotoProfile, VehicleProfile } from './models';

/**
 * Parámetros físicos de un vehículo propio (auto o moto): no vienen del
 * perfil del usuario (VehicleProfile/MotoProfile solo traen costos), son
 * supuestos de velocidad/emisiones para estimar tiempo y CO2.
 */
export interface ParametrosFisicosVehiculo {
  velocidadUrbanaKmH: number;
  velocidadCarreteraKmH: number;
  umbralUrbanoKm: number;
  co2KgPorKm: number;
}

export type RatesConfigAuto = VehicleProfile & ParametrosFisicosVehiculo;

export type RatesConfigMoto = VehicleProfile &
  ParametrosFisicosVehiculo & {
    capacidadMaxPasajeros: number;
    distanciaMaximaKm: number;
  };

/**
 * `CitySettings.tarifaUberDidi` es el costo variable por km (lo que de
 * verdad cambia de una ciudad a otra); tarifa base, cobro por minuto y
 * tiempo de espera quedan como supuestos globales del motor.
 */
export type RatesConfigUberDidi = Pick<CitySettings, 'tarifaUberDidi'> & {
  tarifaBase: number;
  costoPorMinuto: number;
  factorTraficoUrbano: number;
  tiempoEsperaMin: number;
  co2KgPorKm: number;
};

/**
 * `CitySettings.tarifaTransportePublico` es la tarifa plana por viaje.
 * Ver services/transitRouteService.ts: solo se usa cuando existe una
 * "ruta real" simulada entre origen y destino (misma ciudad conocida);
 * en captura manual (solo km) no hay ruta real y la opción no se muestra.
 */
export type RatesConfigTransportePublico = Pick<CitySettings, 'tarifaTransportePublico'> & {
  velocidadEfectivaKmH: number;
  tiempoEsperaTransbordoMin: number;
  distanciaMaximaKm: number;
  co2KgPorPasajeroKm: number;
};

/**
 * `CitySettings.tarifaBlaBlaCar` es el costo variable por km por pasajero.
 * Al no venir de una API en vivo, la opción se marca `esEstimado: true`.
 */
export type RatesConfigBlaBlaCar = Pick<CitySettings, 'tarifaBlaBlaCar'> & {
  velocidadCarreteraKmH: number;
  tiempoEsperaCoordinacionMin: number;
  distanciaMinimaKm: number;
  co2KgPorPasajeroKm: number;
};

/** Sin API en vivo: se marca `esEstimado: true`. */
export interface RatesConfigAutobusForaneo {
  costoPorKmPorPasajero: number;
  tarifaMinima: number;
  velocidadPromedioKmH: number;
  tiempoAnticipacionTerminalMin: number;
  co2KgPorPasajeroKm: number;
}

/** Sin API en vivo: se marca `esEstimado: true`. */
export interface RatesConfigAvion {
  costoBasePorPasajero: number;
  costoPorKmPorPasajero: number;
  velocidadCruceroKmH: number;
  tiempoOverheadAeropuertoMin: number;
  distanciaMinimaKm: number;
  co2KgPorPasajeroKm: number;
}

export interface RatesConfigActivos {
  velocidadCaminarKmH: number;
  velocidadBiciKmH: number;
}

export interface RatesConfigUmbrales {
  distanciaMaxCaminarKm: number;
  distanciaMaxBiciKm: number;
  distanciaMinLargaDistanciaKm: number;
}

export interface RatesConfig {
  moneda: string;
  actualizadoEn: string;
  /** Referencia para amortizar seguro + mantenimiento mensual a costo por km. */
  kmMensualesReferencia: number;
  auto: RatesConfigAuto;
  uberDidi: RatesConfigUberDidi;
  transportePublico: RatesConfigTransportePublico;
  blablacar: RatesConfigBlaBlaCar;
  autobusForaneo: RatesConfigAutobusForaneo;
  avion: RatesConfigAvion;
  moto: RatesConfigMoto;
  activos: RatesConfigActivos;
  umbrales: RatesConfigUmbrales;
}
