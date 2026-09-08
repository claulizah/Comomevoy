import { useCallback, useState } from 'react';
import { directionsService } from '../services/directionsService';
import { placesService } from '../services/placesService';
import { ratesService } from '../services/ratesService';
import { compararTrayecto } from '../services/comparadorService';
import { registrarComparacion } from '../services/historyService';
import { evaluarRutaFrecuente, formatearRutaDescripcion, type SugerenciaRutaFrecuente } from '../services/frequentRouteService';
import { notificarPatronRepetido } from '../services/notificationsService';
import type { Address, ModoCaptura, ResultadoComparacion } from '../types/comparador';

export interface ResultadoConSugerencia {
  resultado: ResultadoComparacion;
  sugerenciaRutaFrecuente?: SugerenciaRutaFrecuente;
}

interface UseComparadorState {
  modoCaptura: ModoCaptura;
  origen: Address | null;
  destino: Address | null;
  distanciaManualKm: string;
  idaYVuelta: boolean;
  numPasajeros: number;
  calculando: boolean;
  error: string | null;
}

const ESTADO_INICIAL: UseComparadorState = {
  modoCaptura: 'direccion',
  origen: null,
  destino: null,
  distanciaManualKm: '',
  idaYVuelta: false,
  numPasajeros: 1,
  calculando: false,
  error: null,
};

export function useComparador() {
  const [estado, setEstado] = useState<UseComparadorState>(ESTADO_INICIAL);

  const setModoCaptura = useCallback((modoCaptura: ModoCaptura) => {
    setEstado((prev) => ({ ...prev, modoCaptura, error: null }));
  }, []);

  const setOrigen = useCallback((origen: Address | null) => {
    setEstado((prev) => ({ ...prev, origen, error: null }));
  }, []);

  const setDestino = useCallback((destino: Address | null) => {
    setEstado((prev) => ({ ...prev, destino, error: null }));
  }, []);

  const setDistanciaManualKm = useCallback((distanciaManualKm: string) => {
    setEstado((prev) => ({ ...prev, distanciaManualKm, error: null }));
  }, []);

  const setIdaYVuelta = useCallback((idaYVuelta: boolean) => {
    setEstado((prev) => ({ ...prev, idaYVuelta }));
  }, []);

  const setNumPasajeros = useCallback((numPasajeros: number) => {
    setEstado((prev) => ({ ...prev, numPasajeros: Math.max(1, numPasajeros) }));
  }, []);

  const calcular = useCallback(async (): Promise<ResultadoConSugerencia | null> => {
    setEstado((prev) => ({ ...prev, calculando: true, error: null }));

    try {
      let distanciaKm: number;

      if (estado.modoCaptura === 'manual') {
        distanciaKm = parseFloat(estado.distanciaManualKm.replace(',', '.'));
        if (!Number.isFinite(distanciaKm) || distanciaKm <= 0) {
          setEstado((prev) => ({ ...prev, calculando: false, error: 'Ingresa una distancia en km válida.' }));
          return null;
        }
      } else {
        if (!estado.origen || !estado.destino) {
          setEstado((prev) => ({ ...prev, calculando: false, error: 'Selecciona un origen y un destino.' }));
          return null;
        }
        if (!estado.origen.placeId || !estado.destino.placeId) {
          setEstado((prev) => ({ ...prev, calculando: false, error: 'No se pudo ubicar el origen o destino.' }));
          return null;
        }

        const origenDetalle = await placesService.getPlaceDetails(estado.origen.placeId);
        const destinoDetalle = await placesService.getPlaceDetails(estado.destino.placeId);
        const ruta = await directionsService.calcularRuta(origenDetalle, destinoDetalle);
        distanciaKm = ruta.distanciaKm;
      }

      const rates = await ratesService.getRates();
      const resultado = compararTrayecto(
        {
          modoCaptura: estado.modoCaptura,
          origen: estado.origen ?? undefined,
          destino: estado.destino ?? undefined,
          distanciaKm,
          idaYVuelta: estado.idaYVuelta,
          numPasajeros: estado.numPasajeros,
        },
        rates
      );

      const entradaHistorial = await registrarComparacion(resultado);
      const rutaComparable = {
        origen: entradaHistorial.origen,
        destino: entradaHistorial.destino,
        distanciaKm: entradaHistorial.distanciaKm,
      };
      const evaluacion = await evaluarRutaFrecuente(rutaComparable);

      let sugerenciaRutaFrecuente: SugerenciaRutaFrecuente | undefined;
      if (evaluacion.debeSugerirGuardar) {
        sugerenciaRutaFrecuente = {
          ...rutaComparable,
          repeticiones: evaluacion.repeticiones,
          opcionGanadora: resultado.opcionRecomendada?.modo ?? '',
        };
      }
      if (evaluacion.debeNotificar) {
        notificarPatronRepetido(evaluacion.repeticiones, formatearRutaDescripcion(rutaComparable)).catch(() => {});
      }

      setEstado((prev) => ({ ...prev, calculando: false }));
      return { resultado, sugerenciaRutaFrecuente };
    } catch (e) {
      setEstado((prev) => ({ ...prev, calculando: false, error: 'Ocurrió un error al calcular el trayecto.' }));
      return null;
    }
  }, [estado.modoCaptura, estado.distanciaManualKm, estado.origen, estado.destino, estado.idaYVuelta, estado.numPasajeros]);

  return {
    ...estado,
    setModoCaptura,
    setOrigen,
    setDestino,
    setDistanciaManualKm,
    setIdaYVuelta,
    setNumPasajeros,
    calcular,
  };
}
