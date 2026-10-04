import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "../lib/session";
import { colors } from "../components/ui";

export default function Index() {
  const { token, loading } = useSession();
  if (loading) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator color={colors.green}/></View>;
  return <Redirect href={token ? "/(tabs)" : "/auth"}/>;
}
