import type { Ionicons } from '@expo/vector-icons';
import type { TransportMode } from '../types/comparador';

export interface TransportModeMeta {
  nombre: string;
  icono: keyof typeof Ionicons.glyphMap;
}

export const TRANSPORT_MODE_META: Record<TransportMode, TransportModeMeta> = {
  auto: { nombre: 'Tu auto', icono: 'car' },
  uber_didi: { nombre: 'Uber/DiDi', icono: 'car-sport' },
  transporte_publico: { nombre: 'Transporte público', icono: 'bus' },
  blablacar: { nombre: 'BlaBlaCar', icono: 'people' },
  autobus_foraneo: { nombre: 'Autobús foráneo', icono: 'bus-outline' },
  avion: { nombre: 'Avión', icono: 'airplane' },
  moto: { nombre: 'Moto', icono: 'speedometer' },
  caminar: { nombre: 'Caminar', icono: 'walk' },
  bicicleta: { nombre: 'Bicicleta', icono: 'bicycle' },
};
