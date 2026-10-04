import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SessionProvider } from "../lib/session";
import { colors } from "../components/ui";

export default function RootLayout() {
  return <SessionProvider><StatusBar style="dark"/><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
    <Stack.Screen name="index"/><Stack.Screen name="auth"/><Stack.Screen name="(tabs)"/>
    <Stack.Screen name="run/[id]" options={{ headerShown: true, title: "Run details", headerStyle: { backgroundColor: colors.cream }, headerTintColor: colors.ink }}/>
    <Stack.Screen name="chat/[id]" options={{ headerShown: true, title: "Run chat", headerStyle: { backgroundColor: colors.cream }, headerTintColor: colors.ink }}/>
  </Stack></SessionProvider>;
}
