import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ResultadoComparacion } from './comparador';
import type { SugerenciaRutaFrecuente } from '../services/frequentRouteService';

export type MainTabParamList = {
  CapturarTrayecto: undefined;
  Historial: undefined;
  PresupuestoMensual: undefined;
  Cuenta: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Resultado: { resultado: ResultadoComparacion; sugerenciaRutaFrecuente?: SugerenciaRutaFrecuente };
  PerfilAuto: undefined;
  DireccionesFavoritas: undefined;
  Suscripcion: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
