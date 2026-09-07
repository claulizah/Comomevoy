/**
 * Tipos del wrapper de Google Maps Platform (autocompletado y ruteo).
 * La implementación real vive detrás de un proxy backend — ver
 * services/placesService.ts y services/directionsService.ts.
 */

export interface PlaceSuggestion {
  placeId: string;
  descripcionPrincipal: string;
  descripcionSecundaria?: string;
}

export interface PlaceDetails {
  placeId: string;
  descripcion: string;
  lat: number;
  lng: number;
}

export interface RouteInfo {
  distanciaKm: number;
  duracionMin: number;
}
