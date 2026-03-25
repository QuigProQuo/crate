"use client";

import { useState, useCallback, useEffect } from "react";
import type { RecordInfo, TrackPreview } from "@/lib/types";

export interface BatchItem {
  record: RecordInfo;
  previews: TrackPreview[];
}

const BATCH_STORAGE_KEY = "crate-batch-items";

function loadBatchItems(): BatchItem[] {
  try {
    const stored = localStorage.getItem(BATCH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveBatchItems(items: BatchItem[]) {
  try {
    localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function useBatchMode() {
  const [enabled, setEnabled] = useState(false);
  const [items, setItems] = useState<BatchItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setItems(loadBatchItems());
  }, []);

  const toggleBatch = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  const addToBatch = useCallback(
    (record: RecordInfo, previews: TrackPreview[]) => {
      setItems((prev) => {
        // Deduplicate by ID
        if (prev.some((item) => item.record.id === record.id)) return prev;
        const next = [...prev, { record, previews }];
        saveBatchItems(next);
        return next;
      });
    },
    []
  );

  const removeFromBatch = useCallback((id: number) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.record.id !== id);
      saveBatchItems(next);
      return next;
    });
  }, []);

  const clearBatch = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(BATCH_STORAGE_KEY);
    } catch {}
  }, []);

  return { enabled, items, toggleBatch, addToBatch, removeFromBatch, clearBatch };
}
