/**
 * Configuración de tarifas usadas por el Motor de comparación.
 * Ver services/ratesService.ts para los valores por defecto y cómo se
 * reemplazan por una fuente remota/variable más adelante.
 */

export interface RatesConfigAuto {
  precioLitroGasolina: number;
  rendimientoKmPorLitro: number;
  costoMantenimientoPorKm: number;
  velocidadUrbanaKmH: number;
  velocidadCarreteraKmH: number;
  umbralUrbanoKm: number;
  co2KgPorKm: number;
}

export interface RatesConfigUberDidi {
  tarifaBase: number;
  costoPorKm: number;
  costoPorMinuto: number;
  factorTraficoUrbano: number;
  tiempoEsperaMin: number;
  co2KgPorKm: number;
}

export interface RatesConfigTransportePublico {
  tarifaPorViaje: number;
  velocidadEfectivaKmH: number;
  tiempoEsperaTransbordoMin: number;
  distanciaMaximaKm: number;
  co2KgPorPasajeroKm: number;
}

export interface RatesConfigBlaBlaCar {
  costoPorKmPorPasajero: number;
  velocidadCarreteraKmH: number;
  tiempoEsperaCoordinacionMin: number;
  distanciaMinimaKm: number;
  co2KgPorPasajeroKm: number;
}

export interface RatesConfigAutobusForaneo {
  costoPorKmPorPasajero: number;
  tarifaMinima: number;
  velocidadPromedioKmH: number;
  tiempoAnticipacionTerminalMin: number;
  co2KgPorPasajeroKm: number;
}

export interface RatesConfigAvion {
  costoBasePorPasajero: number;
  costoPorKmPorPasajero: number;
  velocidadCruceroKmH: number;
  tiempoOverheadAeropuertoMin: number;
  distanciaMinimaKm: number;
  co2KgPorPasajeroKm: number;
}

export interface RatesConfigMoto {
  precioLitroGasolina: number;
  rendimientoKmPorLitro: number;
  costoMantenimientoPorKm: number;
  velocidadUrbanaKmH: number;
  velocidadCarreteraKmH: number;
  umbralUrbanoKm: number;
  capacidadMaxPasajeros: number;
  distanciaMaximaKm: number;
  co2KgPorKm: number;
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
