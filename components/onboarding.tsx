"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingProps {
  open: boolean;
  onClose: () => void;
}

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    title: "Scan Records",
    description:
      "Point your camera at any vinyl record cover. Crate identifies it instantly using AI vision.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    title: "Barcode Lookup",
    description:
      "Got a barcode? Point at it for an instant match from the Discogs database.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 5v14" />
        <path d="M6 5v14" />
        <path d="M9 5v14" />
        <path d="M13 5v14" />
        <path d="M16 5v14" />
        <path d="M19 5v14" />
        <path d="M21 5v14" />
      </svg>
    ),
  },
  {
    title: "Batch Mode",
    description:
      "Scanning a whole crate? Toggle batch mode to scan multiple records in a row.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 3H8l-2 4h12L16 3z" />
      </svg>
    ),
  },
  {
    title: "Grade & Price",
    description:
      "Check market prices and grade vinyl condition using the Goldmine standard.",
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

export function Onboarding({ open, onClose }: OnboardingProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  // Reset to first step when opened
  useEffect(() => {
    if (open) setCurrent(0);
  }, [open]);

  const complete = useCallback(() => {
    onClose();
  }, [onClose]);

  const next = useCallback(() => {
    if (current === steps.length - 1) {
      complete();
    } else {
      setDirection(1);
      setCurrent((c) => c + 1);
    }
  }, [current, complete]);

  if (!open) return null;

  const step = steps[current];
  const isLast = current === steps.length - 1;

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="onboarding-backdrop"
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Skip */}
          <button
            onClick={complete}
            className="absolute top-14 right-5 text-xs text-white/50 tracking-wide active:text-white/80"
          >
            Skip
          </button>

          {/* Step content */}
          <div className="flex flex-1 items-center justify-center w-full px-10">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex flex-col items-center text-center gap-5 max-w-xs"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.08]">
                  {step.icon}
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="text-base font-bold text-white">{step.title}</h2>
                  <p className="text-[13px] leading-relaxed text-white/60">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom controls */}
          <div className="flex flex-col items-center gap-6 pb-16">
            {/* Dot indicators */}
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/25"
                  }`}
                />
              ))}
            </div>

            {/* Next / Get Started button */}
            <button
              onClick={next}
              className="rounded-full bg-white px-8 py-2.5 text-sm font-semibold text-black active:scale-95 transition-transform"
            >
              {isLast ? "Get Started" : "Next"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
