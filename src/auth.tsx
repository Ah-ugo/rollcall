import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";

type Lecturer = { id: string; full_name: string; email: string };
type Ctx = { user: Lecturer | null; loading: boolean; login: (t: string, u: Lecturer) => void; logout: () => void };
const AuthCtx = createContext<Ctx>(null as any);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Lecturer | null>(null);
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    api("/auth/me").then(setUser).catch(() => localStorage.removeItem("token")).finally(() => setLoading(false));
  }, []);
  const login = (t: string, u: Lecturer) => { localStorage.setItem("token", t); setUser(u); };
  const logout = () => { localStorage.removeItem("token"); setUser(null); };
  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
}
