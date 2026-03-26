"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { CollectionItem } from "@/lib/types";

const AUTH_TOKEN_KEY = "crate-auth-token";
const DEVICE_ID_KEY = "crate-device-id";

function getStoredHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (deviceId) headers["X-Device-Id"] = deviceId;
  } catch {}
  return headers;
}

export function useCollection() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sync/collection", {
        headers: getStoredHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (mountedRef.current) {
        setItems(data.items ?? []);
      }
    } catch (err) {
      console.error("[collection] refresh failed", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const addToCollection = useCallback(
    async (discogsId: number, status: "have" | "want", notes?: string) => {
      try {
        const res = await fetch("/api/sync/collection", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getStoredHeaders(),
          },
          body: JSON.stringify({ discogsId, status, notes }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (mountedRef.current && data.item) {
          setItems((prev) => {
            // Replace existing item for same discogsId or add new
            const filtered = prev.filter((i) => i.discogsId !== discogsId);
            return [data.item, ...filtered];
          });
        }
        return data.item as CollectionItem;
      } catch (err) {
        console.error("[collection] add failed", err);
        return null;
      }
    },
    []
  );

  const removeFromCollection = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/sync/collection/${id}`, {
        method: "DELETE",
        headers: getStoredHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (mountedRef.current) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      console.error("[collection] remove failed", err);
    }
  }, []);

  const getStatus = useCallback(
    (discogsId: number): "have" | "want" | null => {
      const item = items.find((i) => i.discogsId === discogsId);
      return item?.status ?? null;
    },
    [items]
  );

  const getItem = useCallback(
    (discogsId: number): CollectionItem | undefined => {
      return items.find((i) => i.discogsId === discogsId);
    },
    [items]
  );

  // Fetch on mount if auth token exists
  useEffect(() => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (token) {
        refresh();
      }
    } catch {}
  }, [refresh]);

  return {
    items,
    loading,
    addToCollection,
    removeFromCollection,
    getStatus,
    getItem,
    refresh,
  };
}
