// Client-side only: stores the JWT issued by /lib/auth.functions.js in
// localStorage and attaches it to every server function call, replacing the
// old Supabase session storage.
import { createMiddleware } from "@tanstack/react-start";

const STORAGE_KEY = "kkmanime_auth_token";

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(STORAGE_KEY, token);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage failures (private browsing, etc.)
  }
}

// Must be registered as a global `functionMiddleware` in `src/start.ts`;
// otherwise the browser never attaches the token to serverFn RPCs.
export const attachAuthToken = createMiddleware({ type: "function" }).client(async ({ next }) => {
  const token = getStoredToken();
  return next({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
});
