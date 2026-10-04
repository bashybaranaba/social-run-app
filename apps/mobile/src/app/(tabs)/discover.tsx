import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { api, type Run } from "../../lib/api";
import { useSession } from "../../lib/session";
import { colors, Empty, RunCard, Title } from "../../components/ui";

const nairobi = { latitude: -1.2864, longitude: 36.8172 };
export default function Discover() {
  const { token, user } = useSession();
  const [coords, setCoords] = useState(nairobi);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "map">("list");
  const [locationNote, setLocationNote] = useState("Near Nairobi");
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    let point = nairobi;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status === "granted") {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        point = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setCoords(point); setLocationNote("Near you · within 25 km");
      } else setLocationNote("Near Nairobi · enable location for nearby runs");
      const result = await api<{ runs: Run[] }>(`/runs?lat=${point.latitude}&lng=${point.longitude}`, token);
      setRuns(result.runs);
    } catch (cause) { Alert.alert("Could not load runs", cause instanceof Error ? cause.message : "Try again"); }
    finally { setLoading(false); }
  }, [token]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return <View style={{ flex: 1, backgroundColor: colors.cream }}>
    <View style={{ paddingHorizontal: 22, paddingTop: 18 }}><Title eyebrow={`GOOD TO SEE YOU, ${user?.name.split(" ")[0].toUpperCase() || "RUNNER"}`} subtitle="Find a run that feels right for you.">Let&apos;s go run.</Title>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 17 }}><Text style={{ color: colors.muted, fontSize: 13 }}>⌖  {locationNote}</Text>
        <View style={{ flexDirection: "row", backgroundColor: "#E8EEE7", padding: 3, borderRadius: 20 }}>
          {(["list", "map"] as const).map(item => <Pressable key={item} onPress={() => setView(item)} style={{ backgroundColor: view === item ? "white" : "transparent", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18 }}><Text style={{ color: colors.green, fontSize: 12, fontWeight: "800" }}>{item === "list" ? "List" : "Map"}</Text></Pressable>)}
        </View></View></View>
    {view === "map" ? <View style={{ flex: 1 }}><MapView provider={PROVIDER_GOOGLE} style={{ flex: 1 }} region={{ ...coords, latitudeDelta: .16, longitudeDelta: .16 }} showsUserLocation>
      {runs.map(run => <Marker key={run.id} coordinate={{ latitude: run.latitude, longitude: run.longitude }} title={run.title} description={`${run.distanceKm} km · ${run.placeName}`} onCalloutPress={() => router.push(`/run/${run.id}`)}/>)}</MapView>
      <View style={{ position: "absolute", bottom: 17, left: 16, right: 16, backgroundColor: "white", borderRadius: 16, padding: 15 }}><Text style={{ color: colors.ink, fontWeight: "800" }}>{runs.length} open {runs.length === 1 ? "run" : "runs"} nearby</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>Tap a marker, then tap its label for details.</Text></View></View>
      : <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 30 }} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.green}/>}>
        <Text style={{ color: colors.ink, fontSize: 19, fontWeight: "800", marginBottom: 14 }}>Runs near you</Text>
        {loading && !runs.length ? <ActivityIndicator color={colors.green} style={{ marginTop: 30 }}/> : runs.length ? runs.map(run => <RunCard key={run.id} run={run} onPress={() => router.push(`/run/${run.id}`)}/>)
          : <Empty icon="↗" title="The first run starts with you" text="No open runs nearby yet. Plan one and invite someone to join."/>}
      </ScrollView>}
  </View>;
}
