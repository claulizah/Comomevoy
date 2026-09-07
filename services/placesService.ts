import type { PlaceDetails, PlaceSuggestion } from '../types/maps';

/**
 * Wrapper de autocompletado/geocodificación de direcciones.
 *
 * IMPORTANTE (seguridad): la API key de Google Maps Platform NUNCA debe
 * vivir en la app. La implementación real de `PlacesService` debe llamar
 * a un endpoint propio (backend/Cloud Function) que a su vez llame a
 * Places Autocomplete y Place Details con la key guardada en el servidor.
 * Mientras ese backend no exista, `MockPlacesService` simula el
 * autocompletado con un catálogo local, sin hacer ninguna llamada de red.
 */
export interface PlacesService {
  autocomplete(query: string): Promise<PlaceSuggestion[]>;
  getPlaceDetails(placeId: string): Promise<PlaceDetails>;
}

interface CatalogEntry extends PlaceDetails {
  descripcionSecundaria: string;
}

const CATALOGO_MOCK: CatalogEntry[] = [
  { placeId: 'mock-cdmx-centro', descripcion: 'Centro Histórico', descripcionSecundaria: 'Ciudad de México, CDMX', lat: 19.4326, lng: -99.1332 },
  { placeId: 'mock-cdmx-polanco', descripcion: 'Polanco', descripcionSecundaria: 'Ciudad de México, CDMX', lat: 19.4326, lng: -99.1932 },
  { placeId: 'mock-cdmx-santa-fe', descripcion: 'Santa Fe', descripcionSecundaria: 'Ciudad de México, CDMX', lat: 19.3593, lng: -99.2593 },
  { placeId: 'mock-cdmx-aeropuerto', descripcion: 'Aeropuerto Internacional CDMX (AICM)', descripcionSecundaria: 'Ciudad de México, CDMX', lat: 19.4363, lng: -99.0721 },
  { placeId: 'mock-gdl-centro', descripcion: 'Centro Histórico', descripcionSecundaria: 'Guadalajara, Jalisco', lat: 20.6767, lng: -103.3475 },
  { placeId: 'mock-mty-centro', descripcion: 'Centro', descripcionSecundaria: 'Monterrey, Nuevo León', lat: 25.6866, lng: -100.3161 },
  { placeId: 'mock-pue-centro', descripcion: 'Centro Histórico', descripcionSecundaria: 'Puebla, Puebla', lat: 19.0414, lng: -98.2063 },
  { placeId: 'mock-qro-centro', descripcion: 'Centro', descripcionSecundaria: 'Querétaro, Querétaro', lat: 20.5888, lng: -100.3899 },
  { placeId: 'mock-toluca-centro', descripcion: 'Centro', descripcionSecundaria: 'Toluca, Estado de México', lat: 19.2926, lng: -99.6568 },
  { placeId: 'mock-cuernavaca-centro', descripcion: 'Centro', descripcionSecundaria: 'Cuernavaca, Morelos', lat: 18.9186, lng: -99.234 },
  { placeId: 'mock-oaxaca-centro', descripcion: 'Centro Histórico', descripcionSecundaria: 'Oaxaca de Juárez, Oaxaca', lat: 17.0654, lng: -96.7237 },
  { placeId: 'mock-veracruz-centro', descripcion: 'Centro', descripcionSecundaria: 'Veracruz, Veracruz', lat: 19.1738, lng: -96.1342 },
  { placeId: 'mock-tijuana-centro', descripcion: 'Zona Centro', descripcionSecundaria: 'Tijuana, Baja California', lat: 32.5283, lng: -117.0187 },
  { placeId: 'mock-merida-centro', descripcion: 'Centro', descripcionSecundaria: 'Mérida, Yucatán', lat: 20.967, lng: -89.6237 },
  { placeId: 'mock-leon-centro', descripcion: 'Centro', descripcionSecundaria: 'León, Guanajuato', lat: 21.1236, lng: -101.6822 },
];

const MAPA_ACENTOS: Record<string, string> = {
  á: 'a',
  é: 'e',
  í: 'i',
  ó: 'o',
  ú: 'u',
  ü: 'u',
  ñ: 'n',
};

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .split('')
    .map((c) => MAPA_ACENTOS[c] ?? c)
    .join('');
}

class MockPlacesService implements PlacesService {
  async autocomplete(query: string): Promise<PlaceSuggestion[]> {
    const q = normalizar(query.trim());
    if (q.length < 2) return [];

    return CATALOGO_MOCK.filter(
      (item) => normalizar(item.descripcion).includes(q) || normalizar(item.descripcionSecundaria).includes(q)
    )
      .slice(0, 6)
      .map((item) => ({
        placeId: item.placeId,
        descripcionPrincipal: item.descripcion,
        descripcionSecundaria: item.descripcionSecundaria,
      }));
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails> {
    const item = CATALOGO_MOCK.find((entry) => entry.placeId === placeId);
    if (!item) {
      throw new Error(`No se encontró el lugar mock con id "${placeId}"`);
    }
    return { placeId: item.placeId, descripcion: item.descripcion, lat: item.lat, lng: item.lng };
  }
}

// TODO(backend): reemplazar por una implementación que llame al proxy propio
// (p. ej. RemotePlacesService) una vez exista el servidor que resguarda la
// API key de Google Maps Platform.
export const placesService: PlacesService = new MockPlacesService();
