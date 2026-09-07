import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ResultadoComparacion } from './comparador';

export type MainTabParamList = {
  CapturarTrayecto: undefined;
  Historial: undefined;
  PresupuestoMensual: undefined;
  Cuenta: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Resultado: { resultado: ResultadoComparacion };
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
