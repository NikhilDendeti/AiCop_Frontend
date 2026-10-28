import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, Me, TokenBody } from "@/api/auth";
import { refreshSession, setSessionExpiredHandler } from "@/api/client";
import { config } from "@/config";
import { tokenStore } from "./tokenStore";

type Status = "loading" | "authenticated" | "anonymous";

interface AuthValue {
  status: Status;
  user: Me | null;
  /** True when the last sign-out was forced (expired session or idle). */
  sessionEnded: boolean;
  signIn: (tokens: TokenBody) => Promise<Me>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll"] as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<Me | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const queryClient = useQueryClient();

  const clearLocal = useCallback(
    (forced: boolean) => {
      tokenStore.clear();
      setUser(null);
      setStatus("anonymous");
      setSessionEnded(forced);
      queryClient.clear();
    },
    [queryClient],
  );

  // Restore a session on page load. The role always comes from /auth/me.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenStore.getRefresh() || !(await refreshSession())) {
        if (!cancelled) clearLocal(false);
        return;
      }
      try {
        const me = await authApi.me();
        if (!cancelled) {
          setUser(me);
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) clearLocal(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clearLocal]);

  useEffect(() => {
    setSessionExpiredHandler(() => clearLocal(true));
    return () => setSessionExpiredHandler(null);
  }, [clearLocal]);

  const signIn = useCallback(async (tokens: TokenBody) => {
    tokenStore.set(tokens.access, tokens.refresh);
    const me = await authApi.me();
    setUser(me);
    setSessionEnded(false);
    setStatus("authenticated");
    return me;
  }, []);

  const signOut = useCallback(async () => {
    const refresh = tokenStore.getRefresh();
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      /* local sign-out proceeds regardless */
    }
    clearLocal(false);
  }, [clearLocal]);

  // Idle timeout
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (status !== "authenticated" || !config.idleTimeoutMinutes) return;
    const reset = () => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        const refresh = tokenStore.getRefresh();
        if (refresh) authApi.logout(refresh).catch(() => undefined);
        clearLocal(true);
      }, config.idleTimeoutMinutes * 60_000);
    };
    reset();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer.current);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [status, clearLocal]);

  const value = useMemo(
    () => ({ status, user, sessionEnded, signIn, signOut }),
    [status, user, sessionEnded, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
