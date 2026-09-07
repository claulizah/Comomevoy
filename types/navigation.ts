import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  CapturarTrayecto: undefined;
  Historial: undefined;
  PresupuestoMensual: undefined;
  Cuenta: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Resultado: undefined;
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
