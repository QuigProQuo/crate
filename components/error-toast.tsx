"use client";

import { useEffect } from "react";

interface ErrorToastProps {
  message: string;
  onDismiss: () => void;
  onRetry?: () => void;
}

export function ErrorToast({ message, onDismiss, onRetry }: ErrorToastProps) {
  useEffect(() => {
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-32 left-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-red-500/30 bg-zinc-900/95 px-4 py-3 shadow-lg backdrop-blur-sm">
      <p className="flex-1 text-sm text-white">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 active:scale-95"
        >
          Retry
        </button>
      )}
      <button
        onClick={onDismiss}
        className="shrink-0 p-1 text-white/50 active:scale-95"
        aria-label="Dismiss"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
