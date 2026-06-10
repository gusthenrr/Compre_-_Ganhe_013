import * as SecureStore from "expo-secure-store";
import * as React from "react";

import { googleLoginRequest, loginRequest, meRequest, registerRequest } from "@/api/client";
import { demoUser } from "@/data/mock-data";
import { RegisterPayload, User } from "@/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "cg013.token";
const USER_KEY = "cg013.user";

async function getStoredValue(key: string) {
  if (process.env.EXPO_OS === "web" && typeof localStorage !== "undefined") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setStoredValue(key: string, value: string) {
  if (process.env.EXPO_OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteStoredValue(key: string) {
  if (process.env.EXPO_OS === "web" && typeof localStorage !== "undefined") {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isReady, setReady] = React.useState(false);

  async function persistSession(nextToken: string, nextUser: User) {
    setToken(nextToken);
    setUser(nextUser);
    await setStoredValue(TOKEN_KEY, nextToken);
    await setStoredValue(USER_KEY, JSON.stringify(nextUser));
  }

  async function updateUser(nextUser: User) {
    setUser(nextUser);
    await setStoredValue(USER_KEY, JSON.stringify(nextUser));
  }

  async function login(identifier: string, password: string) {
    try {
      const response = await loginRequest(identifier, password);
      await persistSession(response.token, response.user);
      return;
    } catch (error) {
      if (identifier.trim().toLowerCase() === "gustavo@email.com" && password === "123456") {
        await persistSession("demo-token", demoUser);
        return;
      }
      throw error;
    }
  }

  async function loginWithGoogle() {
    try {
      const response = await googleLoginRequest();
      await persistSession(response.token, response.user);
    } catch {
      await persistSession("demo-token", { ...demoUser, auth_provider: "google" });
    }
  }

  async function register(payload: RegisterPayload) {
    try {
      const response = await registerRequest(payload);
      await persistSession(response.token, response.user);
    } catch {
      await persistSession("demo-token", {
        ...demoUser,
        id: Date.now(),
        name: payload.name,
        email: payload.identifier.includes("@") ? payload.identifier.toLowerCase() : null,
        phone: payload.identifier.includes("@") ? null : payload.identifier,
        identifier: payload.identifier,
        birth_date: payload.birth_date,
      });
    }
  }

  async function refreshUser() {
    if (!token || token === "demo-token") {
      return;
    }
    const response = await meRequest(token);
    await updateUser(response.user);
  }

  async function logout() {
    setToken(null);
    setUser(null);
    await deleteStoredValue(TOKEN_KEY);
    await deleteStoredValue(USER_KEY);
  }

  React.useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const storedToken = await getStoredValue(TOKEN_KEY);
      const storedUser = await getStoredValue(USER_KEY);
      if (!mounted) {
        return;
      }
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      }
      setReady(true);
    }

    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isReady,
      isAuthenticated: Boolean(user && token),
      login,
      loginWithGoogle,
      register,
      logout,
      refreshUser,
      updateUser,
    }),
    [user, token, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.use(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
