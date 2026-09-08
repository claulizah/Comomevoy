import type { CitySettings, MotoProfile, VehicleProfile } from '../types/models';
import type { RatesConfig } from '../types/rates';
import type { EntityStorage } from './storage';
import { citySettingsStorage } from './citySettingsStorage';
import { motoProfileStorage } from './motoProfileStorage';
import { vehicleProfileStorage } from './vehicleProfileStorage';

/**
 * Perfil de auto/moto y tarifas de ciudad por defecto. Son valores de
 * referencia razonables para México (no vienen de la especificación
 * técnica, que no da cifras concretas) y se usan como fallback mientras
 * no haya nada guardado en AsyncStorage (primer arranque, antes del
 * Onboarding, o si el usuario nunca llegó a guardar su perfil).
 */
export const defaultVehicleProfile: VehicleProfile = {
  id: 'default',
  rendimientoKmPorLitro: 12,
  precioGasolinaPorLitro: 24.5,
  seguroMensual: 1200,
  mantenimientoMensual: 600,
  depreciacionPorKm: 0.8,
  kmMensualesReferencia: 1200,
};

export const defaultMotoProfile: MotoProfile = {
  id: 'default',
  rendimientoKmPorLitro: 35,
  precioGasolinaPorLitro: 24.5,
  seguroMensual: 400,
  mantenimientoMensual: 250,
  depreciacionPorKm: 0.3,
  kmMensualesReferencia: 1000,
};

export const defaultCitySettings: CitySettings = {
  ciudad: 'Ciudad de México',
  tarifaUberDidi: 6.5,
  tarifaTransportePublico: 12,
  tarifaBlaBlaCar: 1.6,
};

/**
 * Arma el RatesConfig completo que usa el motor de comparación a partir
 * del perfil de auto/moto y las tarifas de ciudad de la usuaria, más los
 * parámetros físicos (velocidades, CO2, umbrales) que no vienen de
 * ningún perfil editable. Función pura: fácil de probar sin AsyncStorage.
 */
export function buildRatesConfig(
  vehicleProfile: VehicleProfile,
  citySettings: CitySettings,
  motoProfile: MotoProfile = defaultMotoProfile
): RatesConfig {
  return {
    moneda: 'MXN',
    actualizadoEn: new Date().toISOString(),
    auto: {
      ...vehicleProfile,
      velocidadUrbanaKmH: 30,
      velocidadCarreteraKmH: 90,
      umbralUrbanoKm: 15,
      co2KgPorKm: 0.171,
    },
    uberDidi: {
      tarifaUberDidi: citySettings.tarifaUberDidi,
      tarifaBase: 25,
      costoPorMinuto: 1.8,
      factorTraficoUrbano: 1.15,
      tiempoEsperaMin: 8,
      co2KgPorKm: 0.18,
    },
    transportePublico: {
      tarifaTransportePublico: citySettings.tarifaTransportePublico,
      velocidadEfectivaKmH: 20,
      tiempoEsperaTransbordoMin: 15,
      distanciaMaximaKm: 60,
      co2KgPorPasajeroKm: 0.04,
    },
    blablacar: {
      tarifaBlaBlaCar: citySettings.tarifaBlaBlaCar,
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
      ...motoProfile,
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
}

/** RatesConfig armado solo con los defaults, para cuando no hay nada guardado todavía. */
export const defaultRatesMexico: RatesConfig = buildRatesConfig(defaultVehicleProfile, defaultCitySettings, defaultMotoProfile);

export interface RatesProvider {
  getRates(): Promise<RatesConfig>;
}

export class LocalRatesProvider implements RatesProvider {
  constructor(
    private readonly vehicleStorage: EntityStorage<VehicleProfile> = vehicleProfileStorage,
    private readonly cityStorage: EntityStorage<CitySettings> = citySettingsStorage,
    private readonly motoStorage: EntityStorage<MotoProfile> = motoProfileStorage
  ) {}

  async getRates(): Promise<RatesConfig> {
    const [vehicleProfile, citySettings, motoProfile] = await Promise.all([
      this.vehicleStorage.get(),
      this.cityStorage.get(),
      this.motoStorage.get(),
    ]);

    return buildRatesConfig(
      vehicleProfile ?? defaultVehicleProfile,
      citySettings ?? defaultCitySettings,
      motoProfile ?? defaultMotoProfile
    );
  }
}

export const ratesService: RatesProvider = new LocalRatesProvider();
