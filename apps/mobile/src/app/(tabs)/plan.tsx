import { useEffect, useRef, useState } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { router } from "expo-router";
import { api, type Run } from "../../lib/api";
import { nairobi, optionalCurrentLocation } from "../../lib/location";
import { useSession } from "../../lib/session";
import { Button, colors, Field, Page, Title } from "../../components/ui";

const initialWhen = new Date(Date.now() + 86400000);

export default function Plan() {
  const { token } = useSession();
  const [title, setTitle] = useState(""); const [description, setDescription] = useState("");
  const [placeName, setPlaceName] = useState(""); const [distance, setDistance] = useState("5"); const [pace, setPace] = useState("6:00");
  const [when, setWhen] = useState(initialWhen);
  const [point, setPoint] = useState(nairobi);
  const [pointChosen, setPointChosen] = useState(false);
  const manualSelection = useRef(false);
  const mapRef = useRef<MapView>(null);
  const [picker, setPicker] = useState<"date" | "time" | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { let active = true;
    optionalCurrentLocation().then(current => {
      if (active && current && !manualSelection.current) {
        setPoint(current); setPointChosen(true);
        mapRef.current?.animateToRegion({ ...current, latitudeDelta: .06, longitudeDelta: .06 });
      }
    });
    return () => { active = false; };
  }, []);
  async function submit() {
    if (!token) return;
    const [minutes, seconds] = pace.split(":").map(Number);
    if (!title.trim() || !placeName.trim() || !Number.isFinite(minutes) || !Number.isFinite(seconds) || seconds < 0 || seconds >= 60) {
      Alert.alert("Check your plan", "Add a title, meeting place and pace such as 6:00."); return;
    }
    setBusy(true);
    try {
      if (!pointChosen) throw new Error("Tap the map to choose a meeting area.");
      const result = await api<{ run: Run }>("/runs", token, { method: "POST", body: JSON.stringify({
        title, description, placeName, distanceKm: Number(distance), paceMin: minutes + seconds / 60,
        startAt: when.toISOString(), latitude: point.latitude, longitude: point.longitude
      }) });
      setTitle(""); setDescription(""); setPlaceName("");
      router.push(`/run/${result.run.id}`);
    } catch (cause) { Alert.alert("Could not post run", cause instanceof Error ? cause.message : "Try again"); }
    finally { setBusy(false); }
  }
  return <Page><Title eyebrow="MAKE A PLAN" subtitle="Put a run out there. Someone at your pace might be looking for exactly this.">Plan a run.</Title>
    <Field label="Give it a name" value={title} onChangeText={setTitle} placeholder="Easy morning 5K"/>
    <Field label="Meeting area" value={placeName} onChangeText={setPlaceName} placeholder="Karura Forest"/>
    <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: -8, marginBottom: 10 }}>Tap the map to mark the area. Only an approximate location is shown until you match.</Text>
    <View style={{ height: 170, borderRadius: 15, overflow: "hidden", marginBottom: 18 }}><MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={{ flex: 1 }} initialRegion={{ ...point, latitudeDelta: .06, longitudeDelta: .06 }} onPress={event => { manualSelection.current = true; setPoint(event.nativeEvent.coordinate); setPointChosen(true); }}>{pointChosen && <Marker coordinate={point}/>}</MapView></View>
    {!pointChosen && <Text style={{ color: colors.muted, marginTop: -10, marginBottom: 18 }}>Showing Nairobi. Tap the map to choose your meeting area.</Text>}
    <View style={{ flexDirection: "row", gap: 12 }}><View style={{ flex: 1 }}><Field label="Distance (km)" value={distance} onChangeText={setDistance} keyboardType="decimal-pad"/></View><View style={{ flex: 1 }}><Field label="Pace (min/km)" value={pace} onChangeText={setPace} keyboardType="numbers-and-punctuation"/></View></View>
    <Text style={{ color: colors.ink, fontSize: 13, fontWeight: "700", marginBottom: 7 }}>When</Text>
    <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}><Pressable onPress={() => setPicker("date")} style={{ flex: 1, backgroundColor: "white", borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 15 }}><Text style={{ color: colors.ink, fontWeight: "700" }}>▦  {when.toLocaleDateString()}</Text></Pressable><Pressable onPress={() => setPicker("time")} style={{ flex: 1, backgroundColor: "white", borderWidth: 1, borderColor: colors.border, borderRadius: 13, padding: 15 }}><Text style={{ color: colors.ink, fontWeight: "700" }}>◷  {when.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</Text></Pressable></View>
    {picker && <DateTimePicker value={when} mode={picker} minimumDate={picker === "date" ? new Date() : undefined} onChange={(_, date) => { if (Platform.OS !== "ios") setPicker(null); if (date) setWhen(date); }}/ >}
    {picker && Platform.OS === "ios" && <Pressable onPress={() => setPicker(null)}><Text style={{ color: colors.green, fontWeight: "800", marginBottom: 15 }}>Done</Text></Pressable>}
    <Field label="A little more detail (optional)" value={description} onChangeText={setDescription} placeholder="Conversational pace, all levels welcome" multiline numberOfLines={3} style={{ minHeight: 95, textAlignVertical: "top", paddingTop: 13 }}/>
    <Button onPress={submit} loading={busy}>Post your run  →</Button>
  </Page>;
}
