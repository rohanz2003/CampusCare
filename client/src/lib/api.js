import axios from "axios";

export const TOKEN_KEY = "cc_token";
export const USER_KEY = "cc_user";

// A 401 from these endpoints means "wrong credentials", not "your session died",
// so they must never trigger the session-expired flow — otherwise a mistyped
// password would look like a silent logout.
const CREDENTIAL_PATHS = ["/auth/login", "/auth/register", "/auth/forgot-password", "/auth/reset-password"];

// AuthContext registers a handler here. The interceptor deliberately does NOT
// navigate: it only drops the session and lets the route guards redirect.
// Redirecting imperatively while <PublicOnly> still held a stale user object is
// what caused the /dashboard <-> /login ping-pong that Chrome killed with
// "Throttling navigation to prevent the browser from hanging".
let onSessionExpired = null;

export function setSessionExpiredHandler(fn) {
  onSessionExpired = fn;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function storeSession({ token, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    const isCredentialCheck = CREDENTIAL_PATHS.some((p) => url.includes(p));
    if (err.response?.status === 401 && !isCredentialCheck) {
      clearSession();
      onSessionExpired?.();
    }
    return Promise.reject(err);
  }
);

export function errMsg(err, fallback = "Something went wrong. Please try again.") {
  return err?.response?.data?.message || fallback;
}

export function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
