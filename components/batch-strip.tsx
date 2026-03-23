"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { BatchItem } from "@/hooks/use-batch-mode";

interface BatchStripProps {
  items: BatchItem[];
  onSelect: (item: BatchItem) => void;
  onSummaryOpen: () => void;
}

export function BatchStrip({ items, onSelect, onSummaryOpen }: BatchStripProps) {
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-32 left-0 right-0 z-40 px-4">
      <div className="flex items-center gap-2">
        {/* Scrollable thumbnails */}
        <div className="flex-1 overflow-x-auto flex gap-2 no-scrollbar">
          <AnimatePresence>
            {items.map((item) => (
              <motion.button
                key={item.record.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={() => onSelect(item)}
                className="shrink-0 h-14 w-14 rounded-lg overflow-hidden border-2 border-white/20 active:scale-95"
              >
                {item.record.coverImage ? (
                  <img
                    src={item.record.coverImage}
                    alt={item.record.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-white/10 flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary button with count */}
        <button
          onClick={onSummaryOpen}
          className="shrink-0 flex items-center gap-1.5 rounded-full bg-purple-500/20 backdrop-blur-md px-3 py-2 active:scale-95"
        >
          <span className="text-sm font-semibold text-purple-300">{items.length}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(196,181,253)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
