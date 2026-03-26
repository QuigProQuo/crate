"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DISMISSED_KEY = "crate-install-dismissed";

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // All checks must run client-side
    if (typeof window === "undefined") return;

    // Already dismissed
    if (localStorage.getItem(DISMISSED_KEY)) return;

    // Already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Must be iOS Safari (not in-app browsers which set standalone)
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    if (!isIOS) return;

    // navigator.standalone is true when already added to home screen (Safari-specific)
    if ((navigator as Navigator & { standalone?: boolean }).standalone) return;

    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-32 left-4 right-4 z-45 flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/95 px-4 py-3 shadow-lg backdrop-blur-xl"
        >
          <p className="flex-1 text-sm text-white">
            Install Crate — tap{" "}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline-block align-text-bottom"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>{" "}
            then &ldquo;Add to Home Screen&rdquo;
          </p>
          <button
            onClick={dismiss}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
