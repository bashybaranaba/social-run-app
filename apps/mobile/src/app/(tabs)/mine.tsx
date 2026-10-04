import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { api, type Run } from "../../lib/api";
import { useSession } from "../../lib/session";
import { colors, Empty, RunCard, Title } from "../../components/ui";

export default function MyRuns() {
  const { token } = useSession(); const [runs, setRuns] = useState<Run[]>([]); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { if (!token) return; setLoading(true);
    try { setRuns((await api<{ runs: Run[] }>("/runs?mine=true", token)).runs); }
    catch (cause) { Alert.alert("Could not load your runs", cause instanceof Error ? cause.message : "Try again"); }
    finally { setLoading(false); }
  }, [token]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return <ScrollView style={{ backgroundColor: colors.cream }} contentContainerStyle={{ padding: 22, paddingBottom: 50 }} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.green}/>}>
    <Title eyebrow="YOUR RUNNING PLANS" subtitle="The plans you host and the runs you have joined.">My runs.</Title>
    {loading && !runs.length ? <ActivityIndicator color={colors.green}/> : runs.length ? runs.map(run => <RunCard key={run.id} run={run} onPress={() => router.push(`/run/${run.id}`)}/>)
      : <Empty icon="◌" title="Nothing on the calendar yet" text="Find a run nearby or create your own plan to get started."/>}
  </ScrollView>;
}
