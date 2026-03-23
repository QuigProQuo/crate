"use client";

import { motion } from "framer-motion";
import type { RecordInfo } from "@/lib/types";

interface ARInfoCardProps {
  record: RecordInfo;
  onExpand: () => void;
  onDismiss: () => void;
}

export function ARInfoCard({ record, onExpand, onDismiss }: ARInfoCardProps) {
  return (
    <div className="fixed inset-0 z-25 flex items-center justify-center pointer-events-none">
      <motion.div
        className="relative rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl p-4 max-w-[280px] w-full pointer-events-auto"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white/70 active:scale-95"
          aria-label="Dismiss"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Card content — tap to expand */}
        <button onClick={onExpand} className="w-full text-left active:opacity-80">
          <div className="flex items-start gap-3">
            {/* Album art */}
            {record.coverImage ? (
              <img
                src={record.coverImage}
                alt={record.title}
                className="h-20 w-20 rounded-xl object-cover shadow-lg shrink-0"
              />
            ) : (
              <div className="h-20 w-20 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-bold text-white truncate">
                {record.title}
              </p>
              <p className="text-xs text-white/60 truncate mt-0.5">
                {record.artist}
              </p>
              {record.year > 0 && (
                <p className="text-xs text-white/40 mt-0.5">{record.year}</p>
              )}

              {/* Price badge */}
              {record.lowestPrice != null && (
                <span className="inline-block mt-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                  From ${record.lowestPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Tap hint */}
          <p className="text-center text-[10px] text-white/30 mt-3">
            Tap for full details
          </p>
        </button>
      </motion.div>
    </div>
  );
}
