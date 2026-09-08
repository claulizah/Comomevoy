import * as Sharing from 'expo-sharing';

/**
 * Comparte un archivo LOCAL (la imagen que genera react-native-view-shot)
 * usando el share sheet nativo del dispositivo. Elegí expo-sharing en vez
 * del Share API del núcleo de React Native porque este último no maneja
 * bien URIs de archivo locales en Android (necesita un content:// vía
 * FileProvider, que expo-sharing resuelve; Share.share con una uri
 * file:// falla o se comporta distinto según el OEM). expo-sharing ya es
 * parte del ecosistema Expo que este proyecto usa.
 *
 * Nunca sube el archivo a ningún servidor propio ni de terceros — solo
 * invoca el share sheet del sistema operativo con la URI local.
 */
export async function compartirImagenLocal(uri: string, dialogTitle: string): Promise<void> {
  const disponible = await Sharing.isAvailableAsync();
  if (!disponible) {
    throw new Error('Compartir no está disponible en este dispositivo.');
  }
  await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle });
}
