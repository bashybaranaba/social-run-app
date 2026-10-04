import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { api, formatPace, formatWhen, type RunDetail } from "../../lib/api";
import { useSession } from "../../lib/session";
import { Button, colors, Page, Title } from "../../components/ui";

export default function RunScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useSession();
  const [detail, setDetail] = useState<RunDetail | null>(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { if (!token || !id) return;
    try { setDetail(await api<RunDetail>(`/runs/${id}`, token)); }
    catch (cause) { Alert.alert("Could not load run", cause instanceof Error ? cause.message : "Try again"); }
  }, [id, token]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  async function request() { setBusy(true);
    try { await api(`/runs/${id}/requests`, token, { method: "POST" }); await load(); Alert.alert("Request sent", "The host will decide whether to match."); }
    catch (cause) { Alert.alert("Could not request", cause instanceof Error ? cause.message : "Try again"); }
    finally { setBusy(false); }
  }
  async function respond(requestId: string, status: "accepted" | "declined") { setBusy(true);
    try { await api(`/runs/${id}/requests/${requestId}`, token, { method: "PATCH", body: JSON.stringify({ status }) }); await load(); }
    catch (cause) { Alert.alert("Could not update request", cause instanceof Error ? cause.message : "Try again"); }
    finally { setBusy(false); }
  }
  if (!detail) return <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.cream }}><ActivityIndicator color={colors.green}/></View>;
  const { run } = detail;
  const isHost = run.hostId === user?.id;
  const isMatchedRunner = run.acceptedUserId === user?.id;
  return <Page><Title eyebrow={run.status === "open" ? "OPEN RUN" : "YOU'RE MATCHED"} subtitle={`Hosted by ${run.hostName}`}>{run.title}</Title>
    <View style={{ height: 190, borderRadius: 19, overflow: "hidden", marginBottom: 20 }}><MapView provider={PROVIDER_GOOGLE} style={{ flex: 1 }} scrollEnabled={false} zoomEnabled={false} initialRegion={{ latitude: run.latitude, longitude: run.longitude, latitudeDelta: .03, longitudeDelta: .03 }}><Marker coordinate={{ latitude: run.latitude, longitude: run.longitude }}/></MapView></View>
    <View style={{ backgroundColor: "white", borderColor: colors.border, borderWidth: 1, borderRadius: 19, padding: 20, marginBottom: 19 }}>
      <Text style={{ color: colors.ink, fontWeight: "800", fontSize: 17, marginBottom: 13 }}>The plan</Text>
      <Text style={{ color: colors.muted, marginBottom: 10 }}>◷  {formatWhen(run.startAt)}</Text>
      <Text style={{ color: colors.muted, marginBottom: 10 }}>↗  {run.distanceKm} km  ·  {formatPace(run.paceMin)} /km</Text>
      <Text style={{ color: colors.muted }}>⌖  {run.placeName}</Text>
      {!!run.description && <Text style={{ color: colors.ink, marginTop: 17, lineHeight: 22 }}>{run.description}</Text>}
    </View>
    {!isHost && run.status === "open" && !detail.myRequestStatus && <Button onPress={request} loading={busy}>Request to join  →</Button>}
    {!isHost && detail.myRequestStatus === "pending" && <View style={{ padding: 18, backgroundColor: "#E8F0E5", borderRadius: 14 }}><Text style={{ color: colors.green, fontWeight: "800" }}>Request sent</Text><Text style={{ color: colors.muted, marginTop: 5 }}>We&apos;ll show your match here once the host accepts.</Text></View>}
    {!isHost && detail.myRequestStatus === "declined" && <Text style={{ color: colors.muted }}>This run wasn&apos;t a match. There are more runs to explore.</Text>}
    {isHost && run.status === "open" && <View><Text style={{ color: colors.ink, fontSize: 19, fontWeight: "800", marginBottom: 12 }}>Join requests</Text>
      {detail.requests.filter(r => r.status === "pending").length ? detail.requests.filter(r => r.status === "pending").map(r => <View key={r.id} style={{ backgroundColor: "white", borderColor: colors.border, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 }}><Text style={{ color: colors.ink, fontWeight: "800", fontSize: 16, marginBottom: 12 }}>{r.userName} wants to run with you</Text><View style={{ flexDirection: "row", gap: 10 }}><View style={{ flex: 1 }}><Button onPress={() => respond(r.id, "accepted")} disabled={busy}>Accept</Button></View><View style={{ flex: 1 }}><Button secondary onPress={() => respond(r.id, "declined")} disabled={busy}>Decline</Button></View></View></View>)
        : <Text style={{ color: colors.muted, lineHeight: 21 }}>Your run is live. Check back here for requests.</Text>}
    </View>}
    {run.status === "matched" && (isHost || isMatchedRunner) && <View><View style={{ backgroundColor: "#E8F0E5", padding: 17, borderRadius: 15, marginBottom: 16 }}><Text style={{ color: colors.green, fontWeight: "800", fontSize: 17 }}>You&apos;re running together ✓</Text><Text style={{ color: colors.muted, marginTop: 5 }}>Use chat to agree on the exact meeting spot.</Text></View><Button onPress={() => router.push(`/chat/${id}`)}>Open run chat  →</Button></View>}
    <Pressable onPress={() => router.back()} style={{ padding: 19, alignItems: "center" }}><Text style={{ color: colors.muted, fontWeight: "700" }}>Back to runs</Text></Pressable>
  </Page>;
}
