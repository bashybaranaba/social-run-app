import Constants from "expo-constants";

const baseUrl = (Constants.expoConfig?.extra?.apiUrl as string | undefined)?.replace(/\/$/, "") || "http://localhost:3000";

export type User = { id: string; name: string; email: string };
export type Run = {
  id: string; hostId: string; hostName: string; title: string; description: string;
  startAt: string; distanceKm: number; paceMin: number; latitude: number; longitude: number;
  placeName: string; status: "open" | "matched" | "completed" | "cancelled";
  acceptedUserId?: string;
};
export type JoinRequest = { id: string; userId: string; userName: string; status: string; createdAt: string };
export type RunDetail = { run: Run; myRequestStatus: string | null; requests: JoinRequest[] };
export type Message = { id: string; senderId: string; text: string; createdAt: string };

export async function api<T>(path: string, token?: string | null, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data as T;
}

export function formatPace(value: number) {
  const minutes = Math.floor(value);
  return `${minutes}:${Math.round((value - minutes) * 60).toString().padStart(2, "0")}`;
}
export function formatWhen(value: string) {
  return new Date(value).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
