import type { Address } from '../types/comparador';

/**
 * Determina si existe una "ruta real" de transporte público entre origen
 * y destino (sección 2, Casos límite: "si no hay ruta real de transporte
 * público, se muestran solo las opciones aplicables, sin forzar un
 * estimado").
 *
 * Hoy no hay ninguna API de rutas de transporte público conectada, así
 * que esto es un mock: solo "encuentra" ruta cuando origen y destino
 * pertenecen a la misma ciudad conocida (usa el catálogo de
 * placesService.ts). En captura manual (solo kilómetros) no hay
 * dirección de origen/destino, así que nunca hay ruta real.
 *
 * TODO(backend): reemplazar por una llamada real (p. ej. Google Directions
 * en modo "transit") vía el mismo proxy backend que Places/Directions.
 */
export function hayRutaRealTransportePublico(origen?: Address, destino?: Address): boolean {
  if (!origen || !destino) return false;
  if (!origen.descripcionSecundaria || !destino.descripcionSecundaria) return false;
  return origen.descripcionSecundaria === destino.descripcionSecundaria;
}
