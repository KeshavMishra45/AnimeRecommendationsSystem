import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { signIn as signInFn, signUp as signUpFn, getMe } from "@/lib/auth.functions";
import { getStoredToken, setStoredToken } from "@/lib/auth-token";

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: "not-ready" }),
  signUp: async () => ({ error: "not-ready" }),
  signOut: async () => {},
});

function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = getStoredToken();
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      try {
        const result = await getMe();
        if (!active) return;
        setUser(result?.user ?? null);
        setProfile(result?.profile ?? null);
      } catch (err) {
        console.error("[auth] failed to restore session:", err.message);
        setStoredToken(null);
        if (active) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signIn: async ({ email, password }) => {
        try {
          const result = await signInFn({ data: { email, password } });
          setStoredToken(result.token);
          setUser(result.user ?? null);
          setProfile(result.profile ?? null);
          return { error: null };
        } catch (err) {
          return { error: err.message ?? "Unable to sign in" };
        }
      },
      signUp: async ({ email, password, username }) => {
        try {
          const result = await signUpFn({ data: { email, password, username } });
          setStoredToken(result.token);
          setUser(result.user ?? null);
          setProfile(result.profile ?? null);
          return { error: null };
        } catch (err) {
          return { error: err.message ?? "Unable to sign up" };
        }
      },
      signOut: async () => {
        setStoredToken(null);
        setUser(null);
        setProfile(null);
      },
    }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider, useAuth };
