import * as Location from "expo-location";

export type Coordinates = { latitude: number; longitude: number };
export const nairobi: Coordinates = { latitude: -1.2864, longitude: 36.8172 };

export async function optionalCurrentLocation(): Promise<Coordinates | null> {
  try {
    const existing = await Location.getForegroundPermissionsAsync();
    const allowed = existing.granted || (existing.canAskAgain && (await Location.requestForegroundPermissionsAsync()).granted);
    if (!allowed) return null;

    const last = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 });
    const position = last ?? await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      mayShowUserSettingsDialog: false
    });
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  } catch {
    return null;
  }
}
