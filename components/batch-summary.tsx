"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { BatchItem } from "@/hooks/use-batch-mode";

interface BatchSummaryProps {
  isOpen: boolean;
  items: BatchItem[];
  onClose: () => void;
  onSelect: (item: BatchItem) => void;
  onRemove: (id: number) => void;
  onClear: () => void;
}

export function BatchSummary({
  isOpen,
  items,
  onClose,
  onSelect,
  onRemove,
  onClear,
}: BatchSummaryProps) {
  const totalValue = items.reduce(
    (sum, item) => sum + (item.record.lowestPrice ?? 0),
    0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex-1 flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-14 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Batch Summary</h2>
                <p className="text-sm text-white/50 mt-0.5">
                  {items.length} record{items.length !== 1 ? "s" : ""} scanned
                  {totalValue > 0 && (
                    <span className="text-emerald-400"> · Est. ${totalValue.toFixed(2)}</span>
                  )}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 active:scale-95"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-5 pb-24">
              <div className="flex flex-col gap-2">
                {items.map((item) => (
                  <div
                    key={item.record.id}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-3"
                  >
                    <button
                      onClick={() => {
                        onSelect(item);
                        onClose();
                      }}
                      className="flex flex-1 items-center gap-3 text-left active:opacity-70"
                    >
                      {item.record.coverImage ? (
                        <img
                          src={item.record.coverImage}
                          alt=""
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-white/10 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {item.record.title}
                        </p>
                        <p className="text-xs text-white/50 truncate">
                          {item.record.artist}
                        </p>
                        {item.record.lowestPrice != null && (
                          <p className="text-xs text-emerald-400 mt-0.5">
                            From ${item.record.lowestPrice.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => onRemove(item.record.id)}
                      className="shrink-0 p-2 text-white/30 active:text-red-400"
                      aria-label="Remove"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-md px-5 py-4 border-t border-white/5">
              <button
                onClick={() => {
                  onClear();
                  onClose();
                }}
                className="w-full rounded-xl bg-red-500/10 py-3 text-sm font-medium text-red-400 active:scale-95"
              >
                Clear All
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
