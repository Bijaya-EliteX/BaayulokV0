import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  authApi,
  setTokens,
  clearTokens,
  storeUser,
  getStoredUser,
  type UserProfile,
} from "@/lib/api";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(getStoredUser);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setTokens(res.data.accessToken, res.data.refreshToken);
    storeUser(res.data.user);
    setUser(res.data.user);
  }, []);

  const signup = useCallback(async (fullName: string, email: string, password: string) => {
    const res = await authApi.signup(fullName, email, password);
    setTokens(res.data.accessToken, res.data.refreshToken);
    storeUser(res.data.user);
    setUser(res.data.user);
  }, []);

  const logout = useCallback(async () => {
    const rt = localStorage.getItem("refreshToken");
    if (rt) await authApi.logout(rt).catch(() => {});
    clearTokens();
    setUser(null);
  }, []);

  const refresh = useCallback(async (): Promise<boolean> => {
    const rt = localStorage.getItem("refreshToken");
    if (!rt) return false;
    try {
      const res = await authApi.refresh(rt);
      setTokens(res.data.accessToken, res.data.refreshToken);
      storeUser(res.data.user);
      setUser(res.data.user);
      return true;
    } catch {
      clearTokens();
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      authApi.me().then((res) => {
        storeUser(res.data);
        setUser(res.data);
      }).catch(() => {
        refresh();
      });
    }
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
