import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import {
  api,
  clearSession,
  getToken,
  readStoredUser,
  setSessionExpiredHandler,
  storeSession,
  TOKEN_KEY,
} from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  // Only "loading" when there is a token worth verifying. Starting at true for
  // anonymous visitors made the guards blank the screen on every cold load.
  const [loading, setLoading] = useState(() => Boolean(getToken()));
  // Bumped whenever the session ends. A slow /auth/me (Render free instances
  // cold-start for 30-60s) could otherwise resolve *after* logout and put the
  // user object back, which re-armed the redirect loop.
  const sessionRef = useRef(0);

  const endSession = useCallback(() => {
    sessionRef.current += 1;
    clearSession();
    setUser(null);
    setLoading(false);
  }, []);

  // Any 401 means the token is dead: clear state here and let <ProtectedRoute>
  // handle the redirect declaratively.
  useEffect(() => {
    setSessionExpiredHandler(endSession);
    return () => setSessionExpiredHandler(null);
  }, [endSession]);

  // Signing out in one tab signs out the others too.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === TOKEN_KEY && !e.newValue) endSession();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [endSession]);

  useEffect(() => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    const mySession = sessionRef.current;
    let active = true;
    const isStale = () => !active || mySession !== sessionRef.current;

    api
      .get("/auth/me")
      .then((res) => {
        if (isStale()) return;
        setUser(res.data.user);
        storeSession({ user: res.data.user });
      })
      .catch(() => {
        if (isStale()) return;
        clearSession();
        setUser(null);
      })
      .finally(() => {
        if (!isStale()) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    sessionRef.current += 1;
    storeSession({ token: data.token, user: data.user });
    setUser(data.user);
    setLoading(false);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    if (data.token) {
      sessionRef.current += 1;
      storeSession({ token: data.token, user: data.user });
      setUser(data.user);
      setLoading(false);
      return data.user;
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    endSession();
  }, [endSession]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
