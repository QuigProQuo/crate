"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModal } from "@/hooks/use-modal";
import type { CollectionItem } from "@/lib/types";

function relativeTime(epoch: number): string {
  const diff = Date.now() - epoch;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

type TabKey = "have" | "want";

interface CollectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: CollectionItem[];
  onSelect: (item: CollectionItem) => void;
}

export function CollectionSheet({
  isOpen,
  onClose,
  items,
  onSelect,
}: CollectionSheetProps) {
  const modalRef = useModal(isOpen, onClose);
  const [tab, setTab] = useState<TabKey>("have");

  const haveItems = useMemo(
    () => items.filter((i) => i.status === "have"),
    [items]
  );
  const wantItems = useMemo(
    () => items.filter((i) => i.status === "want"),
    [items]
  );

  const activeItems = tab === "have" ? haveItems : wantItems;

  function handleClose() {
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="rounded-t-2xl bg-zinc-900/95 px-5 pb-10 pt-4 max-h-[70vh] overflow-y-auto"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center mb-3">
              <div className="h-1 w-10 rounded-full bg-white/30" />
            </div>

            <h3 className="text-lg font-semibold text-white mb-4">
              My Collection
            </h3>

            {/* Tab bar */}
            <div className="flex gap-1 mb-4 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setTab("have")}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  tab === "have"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                Have ({haveItems.length})
              </button>
              <button
                onClick={() => setTab("want")}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                  tab === "want"
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-white/50 hover:text-white/70"
                }`}
              >
                Want ({wantItems.length})
              </button>
            </div>

            {/* List */}
            {activeItems.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">
                {tab === "have"
                  ? "No records in your collection yet"
                  : "No records on your want list yet"}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {activeItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      handleClose();
                    }}
                    className="flex items-center gap-3 rounded-xl bg-white/5 p-3 text-left active:bg-white/10 transition-colors"
                  >
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {item.title ?? "Unknown Title"}
                      </p>
                      <p className="text-xs text-white/50 truncate">
                        {item.artist ?? "Unknown Artist"}
                      </p>
                    </div>
                    <span className="text-xs text-white/30 shrink-0">
                      {item.addedAt ? relativeTime(item.addedAt) : ""}
                    </span>
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
