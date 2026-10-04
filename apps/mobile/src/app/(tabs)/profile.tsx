import { Alert, Text, View } from "react-native";
import { router } from "expo-router";
import { useSession } from "../../lib/session";
import { Button, colors, Page, Title } from "../../components/ui";

export default function Profile() {
  const { user, signOut } = useSession();
  return <Page><Title eyebrow="YOUR CORNER" subtitle="A little about the runner behind the plan.">Your profile.</Title>
    <View style={{ backgroundColor: "white", borderColor: colors.border, borderWidth: 1, borderRadius: 20, padding: 23, marginBottom: 22, alignItems: "center" }}><View style={{ backgroundColor: colors.orange, width: 75, height: 75, borderRadius: 38, alignItems: "center", justifyContent: "center", marginBottom: 14 }}><Text style={{ color: "white", fontSize: 31, fontWeight: "800" }}>{user?.name.charAt(0).toUpperCase()}</Text></View><Text style={{ color: colors.ink, fontSize: 23, fontWeight: "800" }}>{user?.name}</Text><Text style={{ color: colors.muted, marginTop: 4 }}>{user?.email}</Text></View>
    <View style={{ backgroundColor: "#E9F0E4", padding: 20, borderRadius: 17, marginBottom: 24 }}><Text style={{ color: colors.green, fontWeight: "800", fontSize: 18, marginBottom: 7 }}>Good things happen outside ↗</Text><Text style={{ color: colors.muted, lineHeight: 21 }}>Meet in public, tell someone your plans, and trust your instincts when meeting a new running partner.</Text></View>
    <Button secondary onPress={() => Alert.alert("Sign out?", "You can sign back in any time.", [{ text: "Stay", style: "cancel" }, { text: "Sign out", onPress: async () => { await signOut(); router.replace("/auth"); } }])}>Sign out</Button>
  </Page>;
}
