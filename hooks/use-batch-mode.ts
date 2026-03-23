"use client";

import { useState, useCallback } from "react";
import type { RecordInfo, TrackPreview } from "@/lib/types";

export interface BatchItem {
  record: RecordInfo;
  previews: TrackPreview[];
}

export function useBatchMode() {
  const [enabled, setEnabled] = useState(false);
  const [items, setItems] = useState<BatchItem[]>([]);

  const toggleBatch = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  const addToBatch = useCallback(
    (record: RecordInfo, previews: TrackPreview[]) => {
      setItems((prev) => {
        // Deduplicate by ID
        if (prev.some((item) => item.record.id === record.id)) return prev;
        return [...prev, { record, previews }];
      });
    },
    []
  );

  const removeFromBatch = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.record.id !== id));
  }, []);

  const clearBatch = useCallback(() => {
    setItems([]);
  }, []);

  return { enabled, items, toggleBatch, addToBatch, removeFromBatch, clearBatch };
}
