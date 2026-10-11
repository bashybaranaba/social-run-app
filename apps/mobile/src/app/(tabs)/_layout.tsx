import { Redirect, Tabs } from "expo-router";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../../lib/session";
import { colors } from "../../components/ui";

const icons: Record<string, string> = { discover: "⌖", plan: "+", mine: "◌", profile: "♙" };
export default function TabsLayout() {
  const { token, loading } = useSession();
  const insets = useSafeAreaInsets();
  if (!loading && !token) return <Redirect href="/auth"/>;
  return <Tabs screenOptions={({ route }) => ({ headerShown: false,
    tabBarActiveTintColor: colors.green, tabBarInactiveTintColor: "#9AA99D", tabBarStyle: { backgroundColor: "white", height: 67 + insets.bottom, paddingBottom: 9 + insets.bottom, paddingTop: 7, borderTopColor: colors.border },
    tabBarLabelStyle: { fontSize: 11, fontWeight: "700" }, tabBarIcon: ({ color }) => <Text style={{ fontSize: route.name === "plan" ? 31 : 25, color, height: 31 }}>{icons[route.name]}</Text> })}>
    <Tabs.Screen name="discover" options={{ title: "Discover" }}/><Tabs.Screen name="plan" options={{ title: "Plan" }}/>
    <Tabs.Screen name="mine" options={{ title: "My runs" }}/><Tabs.Screen name="profile" options={{ title: "Profile" }}/>
    <Tabs.Screen name="index" options={{ href: null }}/>
  </Tabs>;
}
