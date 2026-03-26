"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  deviceId: string;
  isLoggedIn: boolean;
  loading: boolean;
  login: (email: string) => Promise<void>;
  verify: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const TOKEN_KEY = "crate-auth-token";
const REFRESH_KEY = "crate-refresh-token";
const DEVICE_KEY = "crate-device-id";

function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function extractUser(payload: Record<string, unknown>): User | null {
  if (!payload.sub && !payload.id) return null;
  return {
    id: (payload.sub ?? payload.id) as string,
    email: (payload.email ?? "") as string,
    displayName: (payload.displayName ?? payload.display_name ?? payload.email ?? "") as string,
  };
}

function getExpiry(payload: Record<string, unknown>): number | null {
  const exp = payload.exp;
  if (typeof exp === "number") return exp * 1000; // convert to ms
  return null;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTokenState, setRefreshToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const scheduleRefresh = useCallback(
    (tok: string, doRefresh: () => Promise<void>) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      const payload = decodeJwtPayload(tok);
      if (!payload) return;
      const expiry = getExpiry(payload);
      if (!expiry) return;
      const msUntilRefresh = expiry - Date.now() - 60_000; // 1 minute before
      if (msUntilRefresh <= 0) {
        doRefresh();
        return;
      }
      refreshTimerRef.current = setTimeout(doRefresh, msUntilRefresh);
    },
    []
  );

  const storeTokens = useCallback(
    (newToken: string, newRefresh: string) => {
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(REFRESH_KEY, newRefresh);
      setToken(newToken);
      setRefreshToken(newRefresh);
    },
    []
  );

  const refreshSession = useCallback(async () => {
    const rt = localStorage.getItem(REFRESH_KEY);
    if (!rt) {
      clearAuth();
      return;
    }
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: rt }),
      });
      if (!res.ok) {
        clearAuth();
        return;
      }
      const data = await res.json();
      storeTokens(data.token, data.refreshToken);
      const payload = decodeJwtPayload(data.token);
      if (payload) {
        const u = extractUser(payload);
        if (u) setUser(u);
      }
      scheduleRefresh(data.token, refreshSession);
    } catch {
      clearAuth();
    }
  }, [clearAuth, storeTokens, scheduleRefresh]);

  // Initialize on mount
  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);

    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_KEY);

    if (storedToken) {
      const payload = decodeJwtPayload(storedToken);
      if (payload) {
        const expiry = getExpiry(payload);
        if (expiry && expiry < Date.now()) {
          // Token expired — try refresh
          if (storedRefresh) {
            setRefreshToken(storedRefresh);
            refreshSession().finally(() => setLoading(false));
            return;
          } else {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_KEY);
          }
        } else {
          // Token still valid
          const u = extractUser(payload);
          if (u) setUser(u);
          setToken(storedToken);
          if (storedRefresh) setRefreshToken(storedRefresh);
          scheduleRefresh(storedToken, refreshSession);
        }
      }
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const login = useCallback(async (email: string) => {
    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to send magic link");
    }
  }, []);

  const verify = useCallback(
    async (email: string, code: string) => {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, deviceId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Verification failed");
      }
      const data = await res.json();
      storeTokens(data.token, data.refreshToken);
      setUser(data.user);
      scheduleRefresh(data.token, refreshSession);

      // Merge anonymous device data
      try {
        await fetch("/api/devices/merge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({ deviceId }),
        });
      } catch {
        // Non-critical — merge can be retried later
      }
    },
    [deviceId, storeTokens, scheduleRefresh, refreshSession]
  );

  const logout = useCallback(async () => {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    clearAuth();
    if (currentToken) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
        });
      } catch {
        // Already cleared locally — server logout is best-effort
      }
    }
  }, [clearAuth]);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return { "X-Device-Id": deviceId };
  }, [token, deviceId]);

  return {
    user,
    token,
    refreshToken: refreshTokenState,
    deviceId,
    isLoggedIn: user !== null,
    loading,
    login,
    verify,
    logout,
    refreshSession,
    getAuthHeaders,
  };
}
