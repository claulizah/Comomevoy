import * as Notifications from 'expo-notifications';

/**
 * Notificaciones locales (programadas en el dispositivo, sin backend ni
 * push token — ver hallazgos sobre expo-notifications en el historial de
 * este prompt). Solo se usa scheduleNotificationAsync con un trigger
 * TIME_INTERVAL; nunca getDevicePushTokenAsync/getExpoPushTokenAsync.
 */

const CANAL_DEFAULT = 'default';
let canalListo = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function asegurarCanalAndroid(): Promise<void> {
  if (canalListo) return;
  await Notifications.setNotificationChannelAsync(CANAL_DEFAULT, {
    name: 'General',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  canalListo = true;
}

async function tienePermiso(): Promise<boolean> {
  const actual = await Notifications.getPermissionsAsync();
  if (actual.granted) return true;
  const solicitado = await Notifications.requestPermissionsAsync();
  return solicitado.granted;
}

export async function notificarPatronRepetido(repeticiones: number, rutaDescripcion: string): Promise<void> {
  if (!(await tienePermiso())) return;
  await asegurarCanalAndroid();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Vas seguido por el mismo camino',
      body: `Llevas ${repeticiones} veces ${rutaDescripcion} esta semana. Guárdalo como ruta frecuente para no repetir la captura.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 1,
      channelId: CANAL_DEFAULT,
    },
  });
}
