import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { api, type User } from "./api";

type Session = { token: string | null; user: User | null; loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void> };
const Context = createContext<Session | null>(null);
const key = "runside-token";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; (async () => {
    const saved = await SecureStore.getItemAsync(key);
    if (saved) {
      try { const profile = await api<User>("/me", saved); if (active) { setToken(saved); setUser(profile); } }
      catch { await SecureStore.deleteItemAsync(key); }
    }
    if (active) setLoading(false);
  })(); return () => { active = false; }; }, []);
  async function authenticate(path: string, body: object) {
    const result = await api<{ token: string; user: User }>(path, null, { method: "POST", body: JSON.stringify(body) });
    await SecureStore.setItemAsync(key, result.token);
    setToken(result.token); setUser(result.user);
  }
  const value = useMemo<Session>(() => ({ token, user, loading,
    signIn: (email, password) => authenticate("/auth/login", { email, password }),
    signUp: (name, email, password) => authenticate("/auth/register", { name, email, password }),
    signOut: async () => { await SecureStore.deleteItemAsync(key); setToken(null); setUser(null); }
  }), [token, user, loading]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSession() {
  const context = useContext(Context);
  if (!context) throw new Error("SessionProvider is missing");
  return context;
}
