import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api, type Message } from "../../lib/api";
import { useSession } from "../../lib/session";
import { colors } from "../../components/ui";

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>(); const { token, user } = useSession();
  const [messages, setMessages] = useState<Message[]>([]); const [text, setText] = useState(""); const [busy, setBusy] = useState(false);
  const scroller = useRef<ScrollView>(null);
  const load = useCallback(async () => { if (!token || !id) return;
    try { setMessages((await api<{ messages: Message[] }>(`/runs/${id}/messages`, token)).messages); }
    catch { /* Polling can fail briefly on a weak connection; sending surfaces errors. */ }
  }, [id, token]);
  useEffect(() => { const initial = setTimeout(load, 0); const interval = setInterval(load, 5000); return () => { clearTimeout(initial); clearInterval(interval); }; }, [load]);
  async function send() { if (!text.trim() || !token || busy) return;
    const value = text.trim(); setBusy(true); setText("");
    try { await api(`/runs/${id}/messages`, token, { method: "POST", body: JSON.stringify({ text: value }) }); await load(); }
    catch (cause) { setText(value); Alert.alert("Could not send", cause instanceof Error ? cause.message : "Try again"); }
    finally { setBusy(false); }
  }
  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.cream }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
    <View style={{ backgroundColor: "#E9F1E7", paddingHorizontal: 18, paddingVertical: 10 }}><Text style={{ color: colors.green, fontSize: 12, textAlign: "center" }}>Agree on a public meeting spot before the run.</Text></View>
    <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ padding: 18, flexGrow: 1, justifyContent: messages.length ? "flex-end" : "center" }} onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}>
      {!messages.length && <Text style={{ color: colors.muted, textAlign: "center", lineHeight: 23 }}>Say hello! A good run starts with a plan.</Text>}
      {messages.map(message => { const mine = message.senderId === user?.id; return <View key={message.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", backgroundColor: mine ? colors.green : "white", maxWidth: "82%", paddingHorizontal: 15, paddingVertical: 11, borderRadius: 16, marginBottom: 9 }}><Text style={{ color: mine ? "white" : colors.ink, fontSize: 15, lineHeight: 21 }}>{message.text}</Text><Text style={{ color: mine ? "#CDE0D2" : colors.muted, fontSize: 10, alignSelf: "flex-end", marginTop: 4 }}>{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</Text></View>; })}
    </ScrollView>
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, padding: 12, backgroundColor: "white", borderTopWidth: 1, borderTopColor: colors.border }}><TextInput value={text} onChangeText={setText} placeholder="Message your running partner" placeholderTextColor="#A1AEA2" multiline style={{ flex: 1, minHeight: 44, maxHeight: 120, backgroundColor: colors.cream, borderRadius: 20, paddingHorizontal: 15, paddingTop: 11, color: colors.ink }}/><Pressable onPress={send} disabled={busy || !text.trim()} style={{ backgroundColor: colors.green, width: 43, height: 43, borderRadius: 22, alignItems: "center", justifyContent: "center", opacity: busy || !text.trim() ? .5 : 1 }}><Text style={{ color: "white", fontSize: 24 }}>↑</Text></Pressable></View>
  </KeyboardAvoidingView>;
}
