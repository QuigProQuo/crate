"use client";

import { useState, useCallback, useEffect } from "react";
import type { RecordInfo } from "@/lib/types";

const STORAGE_KEY = "crate-scan-history";
const MAX_HISTORY = 20;

export function useScanHistory() {
  const [history, setHistory] = useState<RecordInfo[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const addToHistory = useCallback((record: RecordInfo) => {
    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((r) => r.id !== record.id);
      // Add to front, cap at MAX_HISTORY
      const next = [record, ...filtered].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return { history, addToHistory, clearHistory };
}
