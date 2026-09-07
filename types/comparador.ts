/**
 * Modelo de datos del Motor de comparación (subconjunto aplicable a este módulo,
 * a falta de la especificación técnica completa — ver nota en services/comparadorService.ts).
 */

export type TransportMode =
  | 'auto'
  | 'uber_didi'
  | 'transporte_publico'
  | 'blablacar'
  | 'autobus_foraneo'
  | 'avion'
  | 'moto'
  | 'caminar'
  | 'bicicleta';

export type ModoCaptura = 'direccion' | 'manual';

export interface Address {
  descripcion: string;
  descripcionSecundaria?: string;
  placeId?: string;
  lat?: number;
  lng?: number;
}

export interface TrayectoInput {
  modoCaptura: ModoCaptura;
  origen?: Address;
  destino?: Address;
  distanciaKm: number;
  idaYVuelta: boolean;
  numPasajeros: number;
}

export interface OpcionTransporte {
  modo: TransportMode;
  nombre: string;
  disponible: boolean;
  motivoNoDisponible?: string;
  /** true si el costo/tiempo es una estimación por fórmula, sin API en vivo (ver sección 2, Casos límite). */
  esEstimado: boolean;
  costoTotal: number;
  costoPorPersona: number;
  tiempoEstimadoMin: number;
  co2Kg: number;
  esRecomendada: boolean;
}

export interface ResultadoComparacion {
  input: TrayectoInput;
  opciones: OpcionTransporte[];
  opcionRecomendada?: OpcionTransporte;
  mensajeDestacado?: string;
  distanciaCaminable: boolean;
  distanciaLargaDistancia: boolean;
  generadoEn: string;
}
