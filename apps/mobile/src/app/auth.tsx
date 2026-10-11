import { useEffect, useRef, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Redirect, router } from "expo-router";
import { Button, colors, Field, Page } from "../components/ui";
import { useSession } from "../lib/session";

export default function Auth() {
  const { token, signIn, signUp } = useSession();
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const pageRef = useRef<ScrollView>(null);
  const scrollForField = useRef(false);
  useEffect(() => {
    const shown = Keyboard.addListener("keyboardDidShow", () => {
      if (scrollForField.current) requestAnimationFrame(() => pageRef.current?.scrollToEnd({ animated: true }));
    });
    const hidden = Keyboard.addListener("keyboardDidHide", () => { scrollForField.current = false; });
    return () => { shown.remove(); hidden.remove(); };
  }, []);
  const showFieldsAboveKeyboard = () => {
    scrollForField.current = true;
    if (Keyboard.isVisible()) requestAnimationFrame(() => pageRef.current?.scrollToEnd({ animated: true }));
  };
  if (token) return <Redirect href="/(tabs)"/>;
  async function submit() {
    setBusy(true);
    try {
      if (mode === "register") await signUp(name, email, password);
      else await signIn(email, password);
      router.replace("/(tabs)");
    } catch (cause) { Alert.alert("Could not continue", cause instanceof Error ? cause.message : "Please try again"); }
    finally { setBusy(false); }
  }
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <Page scrollRef={pageRef}><View style={{ marginTop: 46, marginBottom: 45 }}><View style={{ backgroundColor: colors.green, width: 63, height: 63, borderRadius: 18, alignItems: "center", justifyContent: "center" }}><Text style={{ color: colors.lime, fontSize: 35, fontWeight: "900" }}>R.</Text></View>
      <Text style={{ color: colors.ink, fontSize: 45, fontWeight: "900", letterSpacing: -2.5, lineHeight: 48, marginTop: 35 }}>Better runs,{"\n"}better company.</Text>
      <Text style={{ color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 12 }}>Find a running partner at your pace, right around the corner.</Text></View>
      <View style={{ backgroundColor: "white", borderRadius: 22, padding: 22, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ color: colors.ink, fontSize: 22, fontWeight: "800", marginBottom: 20 }}>{mode === "register" ? "Create your account" : "Welcome back"}</Text>
        {mode === "register" && <Field label="Your name" value={name} onChangeText={setName} onFocus={() => { scrollForField.current = false; }} autoCapitalize="words" placeholder="Alex Runner"/>}
        <Field label="Email" value={email} onChangeText={setEmail} onFocus={showFieldsAboveKeyboard} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="you@example.com"/>
        <Field label="Password" value={password} onChangeText={setPassword} onFocus={showFieldsAboveKeyboard} secureTextEntry placeholder="At least 8 characters"/>
        <Button onPress={submit} loading={busy}>{mode === "register" ? "Create account" : "Sign in"}</Button>
        <Pressable onPress={() => setMode(mode === "register" ? "login" : "register")} style={{ paddingTop: 21, alignItems: "center" }}><Text style={{ color: colors.green, fontWeight: "700" }}>{mode === "register" ? "Already have an account? Sign in" : "New here? Create an account"}</Text></Pressable>
      </View>
      <Text style={{ color: colors.muted, textAlign: "center", fontSize: 12, lineHeight: 18, marginTop: 20 }}>Plan a run. Find your person. Get outside.</Text>
    </Page></KeyboardAvoidingView>;
}
