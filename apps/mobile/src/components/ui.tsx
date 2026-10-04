import { ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { formatPace, formatWhen, type Run } from "../lib/api";

export const colors = { ink: "#19382D", green: "#214D3D", lime: "#D8F370", cream: "#F7F8F2", muted: "#74867A", border: "#E3E9E1", white: "#FFFFFF", orange: "#ED9B69" };
export function Page({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return scroll ? <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} keyboardShouldPersistTaps="handled">{children}</ScrollView>
    : <View style={[styles.page, styles.pageContent]}>{children}</View>;
}
export function Title({ eyebrow, children, subtitle }: { eyebrow?: string; children: ReactNode; subtitle?: string }) {
  return <View style={{ marginBottom: 23 }}>{eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}<Text style={styles.title}>{children}</Text>{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}</View>;
}
export function Button({ children, onPress, secondary, disabled, loading }: { children: ReactNode; onPress: () => void; secondary?: boolean; disabled?: boolean; loading?: boolean }) {
  return <Pressable onPress={onPress} disabled={disabled || loading} style={[styles.button, secondary && styles.secondary, (disabled || loading) && { opacity: .5 }]}>
    {loading ? <ActivityIndicator color={secondary ? colors.green : "white"}/> : <Text style={[styles.buttonText, secondary && { color: colors.green }]}>{children}</Text>}
  </Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={{ marginBottom: 15 }}><Text style={styles.label}>{label}</Text><TextInput placeholderTextColor="#A1AEA2" style={styles.input} {...props}/></View>;
}
export function RunCard({ run, onPress }: { run: Run; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.runCard}>
    <View style={styles.cardTop}><Text style={styles.pill}>{run.status === "open" ? "OPEN RUN" : "MATCHED"}</Text><Text style={styles.cardPlace}>⌖ {run.placeName}</Text></View>
    <Text style={styles.cardTitle}>{run.title}</Text>
    <Text style={styles.cardMeta}>◷  {formatWhen(run.startAt)}</Text>
    <Text style={styles.cardMeta}>↗  {run.distanceKm} km  ·  {formatPace(run.paceMin)} /km</Text>
    <View style={styles.cardBottom}><View style={styles.avatar}><Text style={styles.avatarText}>{run.hostName.charAt(0).toUpperCase()}</Text></View><Text style={styles.host}>Hosted by {run.hostName}</Text><Text style={styles.cardArrow}>→</Text></View>
  </Pressable>;
}
export function Empty({ icon, title, text }: { icon: string; title: string; text: string }) {
  return <View style={styles.empty}><Text style={{ fontSize: 35, marginBottom: 10 }}>{icon}</Text><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text></View>;
}
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, pageContent: { padding: 22, paddingBottom: 42 },
  eyebrow: { color: "#69A574", fontWeight: "800", fontSize: 11, letterSpacing: 2, marginBottom: 10 },
  title: { color: colors.ink, fontWeight: "800", fontSize: 36, letterSpacing: -1.8, lineHeight: 42 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 8 },
  button: { minHeight: 54, paddingHorizontal: 20, borderRadius: 30, alignItems: "center", justifyContent: "center", backgroundColor: colors.green },
  secondary: { backgroundColor: "#E8EFE5" }, buttonText: { color: "white", fontWeight: "800", fontSize: 15 },
  label: { color: colors.ink, fontSize: 13, fontWeight: "700", marginBottom: 7 },
  input: { backgroundColor: "white", borderWidth: 1, borderColor: colors.border, borderRadius: 13, minHeight: 52, paddingHorizontal: 15, color: colors.ink, fontSize: 15 },
  runCard: { backgroundColor: "white", borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 17, marginBottom: 13 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  pill: { overflow: "hidden", backgroundColor: "#E7F3E3", color: "#5A965E", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, fontSize: 10, fontWeight: "800", letterSpacing: .7 },
  cardPlace: { color: colors.muted, fontSize: 11, maxWidth: "55%" },
  cardTitle: { color: colors.ink, fontWeight: "800", fontSize: 19, letterSpacing: -.4, marginBottom: 12 },
  cardMeta: { color: colors.muted, fontSize: 13, marginBottom: 6 },
  cardBottom: { borderTopWidth: 1, borderTopColor: "#EEF1EC", marginTop: 12, paddingTop: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: { backgroundColor: colors.orange, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "white", fontSize: 12, fontWeight: "800" }, host: { color: colors.muted, fontSize: 12, flex: 1 },
  cardArrow: { color: "#5B9B67", fontSize: 20 },
  empty: { backgroundColor: "white", borderWidth: 1, borderColor: colors.border, borderRadius: 19, alignItems: "center", padding: 35, marginTop: 20 },
  emptyTitle: { color: colors.ink, fontSize: 19, fontWeight: "800", marginBottom: 7 },
  emptyText: { color: colors.muted, textAlign: "center", lineHeight: 20, fontSize: 13 }
});
