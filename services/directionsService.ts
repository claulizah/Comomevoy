import type { PlaceDetails, RouteInfo } from '../types/maps';

/**
 * Cálculo de distancia/duración entre dos lugares.
 *
 * Igual que en placesService.ts: la implementación real debe llamar a un
 * proxy backend propio que use la Directions/Distance Matrix API de
 * Google con la key resguardada en el servidor — nunca desde la app.
 * `MockDirectionsService` aproxima la distancia por carretera con la
 * distancia en línea recta (Haversine) multiplicada por un factor de
 * sinuosidad, sin hacer ninguna llamada de red.
 */
export interface DirectionsService {
  calcularRuta(origen: PlaceDetails, destino: PlaceDetails): Promise<RouteInfo>;
}

const RADIO_TIERRA_KM = 6371;
const FACTOR_SINUOSIDAD = 1.25;
const VELOCIDAD_ESTIMADA_KMH = 60;

function aRadianes(grados: number): number {
  return (grados * Math.PI) / 180;
}

function distanciaHaversineKm(origen: PlaceDetails, destino: PlaceDetails): number {
  const dLat = aRadianes(destino.lat - origen.lat);
  const dLng = aRadianes(destino.lng - origen.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(origen.lat)) * Math.cos(aRadianes(destino.lat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return RADIO_TIERRA_KM * c;
}

class MockDirectionsService implements DirectionsService {
  async calcularRuta(origen: PlaceDetails, destino: PlaceDetails): Promise<RouteInfo> {
    const distanciaLineaRecta = distanciaHaversineKm(origen, destino);
    const distanciaKm = Math.round(distanciaLineaRecta * FACTOR_SINUOSIDAD * 10) / 10;
    const duracionMin = Math.round((distanciaKm / VELOCIDAD_ESTIMADA_KMH) * 60);
    return { distanciaKm, duracionMin };
  }
}

// TODO(backend): reemplazar por una implementación que llame al proxy propio
// (Directions API / Distance Matrix) una vez exista el servidor.
export const directionsService: DirectionsService = new MockDirectionsService();
