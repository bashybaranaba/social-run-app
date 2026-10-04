import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "RunSide",
  slug: "runside",
  scheme: "runside",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  icon: "./assets/icon.png",
  android: {
    package: "io.runside.app",
    versionCode: 1,
    permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
    adaptiveIcon: { foregroundImage: "./assets/android-icon-foreground.png", backgroundColor: "#214D3D" }
  },
  plugins: [
    "expo-router",
    ["expo-location", { locationWhenInUsePermission: "RunSide uses your location to find runs near you." }],
    ["react-native-maps", { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY || "" }],
    "@react-native-community/datetimepicker",
    "expo-secure-store"
  ],
  extra: { apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000" }
};
export default config;
