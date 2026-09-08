/**
 * Entidades del modelo de datos (sección 7 de la especificación técnica).
 * Son solo tipos: la persistencia (AsyncStorage local / respaldo con cuenta)
 * se implementa en un prompt posterior. VehicleProfile, MotoProfile y
 * CitySettings ya se usan en el motor de comparación (services/ratesService.ts)
 * con un registro por defecto mientras no exista la pantalla/almacenamiento real.
 */

/** Se respalda con cuenta. */
export interface VehicleProfile {
  id: string;
  rendimientoKmPorLitro: number;
  precioGasolinaPorLitro: number;
  seguroMensual: number;
  mantenimientoMensual: number;
  depreciacionPorKm: number;
  /**
   * Kilometraje mensual de referencia usado para amortizar seguro +
   * mantenimiento a costo por km (ver services/comparadorService.ts).
   * No es un campo de la especificación técnica — es el supuesto de
   * amortización documentado ahí, movido aquí para que sea editable
   * desde PerfilAuto en vez de vivir fijo en el código.
   */
  kmMensualesReferencia: number;
}

/** Siempre local. Mismos campos que VehicleProfile. */
export type MotoProfile = Omit<VehicleProfile, 'id'> & { id: string };

/** Siempre local. */
export interface FavoriteAddress {
  id: string;
  etiqueta: string;
  direccion: string;
  placeId?: string;
  lat?: number;
  lng?: number;
}

/** Se respalda con cuenta. */
export interface ComparisonHistory {
  id: string;
  fecha: string;
  origen?: string;
  destino?: string;
  distanciaKm: number;
  resultadosPorModo: Array<{ modo: string; costoTotal: number; costoPorPersona: number }>;
  opcionGanadora: string;
}

/** Se respalda con cuenta. */
export interface FrequentRoute {
  id: string;
  origen: string;
  destino: string;
  opcionGanadora: string;
  vecesUsada: number;
}

/** Siempre local. */
export interface CitySettings {
  ciudad: string;
  tarifaUberDidi: number;
  tarifaTransportePublico: number;
  tarifaBlaBlaCar: number;
}

/** Se respalda con cuenta. */
export interface MonthlyBudget {
  monto: number;
  mes: string;
}

/** Se respalda con cuenta. */
export interface Account {
  correo: string;
  pushToken?: string;
}

/** Se respalda con cuenta. */
export interface Subscription {
  estado: 'activa' | 'inactiva' | 'en_prueba' | 'cancelada';
}

/** Siempre local. */
export interface InstallId {
  id: string;
  usoDiarioPorFuncion: Record<string, number>;
}
