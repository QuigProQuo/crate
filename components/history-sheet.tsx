"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { RecordInfo } from "@/lib/types";

interface HistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  history: RecordInfo[];
  onSelect: (record: RecordInfo) => void;
}

export function HistorySheet({ isOpen, onClose, history, onSelect }: HistorySheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="rounded-t-2xl bg-zinc-900/95 px-5 pb-10 pt-4 max-h-[60vh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-3">
              <div className="h-1 w-10 rounded-full bg-white/30" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-4">Recent Scans</h3>

            {history.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">No scans yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => {
                      onSelect(record);
                      onClose();
                    }}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-left active:bg-white/10 transition-colors"
                  >
                    {record.coverImage ? (
                      <img
                        src={record.coverImage}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{record.title}</p>
                      <p className="text-xs text-white/50 truncate">{record.artist}</p>
                    </div>
                    {record.year > 0 && (
                      <span className="text-xs text-white/30 shrink-0">{record.year}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
