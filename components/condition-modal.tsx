"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModal } from "@/hooks/use-modal";
import type { ConditionGrade } from "@/lib/types";
import { ConditionBadge } from "@/components/condition-badge";

interface ConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapturePhoto: () => Blob | null;
  onGraded: (grade: ConditionGrade) => void;
}

type GradingStep = "instructions" | "loading" | "results";

export function ConditionModal({
  isOpen,
  onClose,
  onCapturePhoto,
  onGraded,
}: ConditionModalProps) {
  const [step, setStep] = useState<GradingStep>("instructions");
  const [grade, setGrade] = useState<ConditionGrade | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (blob: Blob) => {
    setStep("loading");
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", blob, "grade.jpg");

      const res = await fetch("/api/grade", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Grading failed");
      }

      const result: ConditionGrade = await res.json();
      setGrade(result);
      setStep("results");
      onGraded(result);
    } catch {
      setError("Failed to grade. Try again with a clearer photo.");
      setStep("instructions");
    }
  };

  const handleCapture = () => {
    const blob = onCapturePhoto();
    if (blob) {
      processImage(blob);
    }
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
    e.target.value = "";
  };

  const handleClose = () => {
    setStep("instructions");
    setGrade(null);
    setError(null);
    onClose();
  };

  const modalRef = useModal(isOpen, handleClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm outline-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="rounded-t-2xl bg-zinc-900/95 px-6 pb-10 pt-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">
                Grade Condition
              </h3>
              <button
                onClick={handleClose}
                className="p-1 text-white/50 active:scale-95"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFilePick}
            />

            {/* Instructions step */}
            {step === "instructions" && (
              <div className="text-center py-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <p className="text-white/70 text-sm mb-6">
                  Take a close-up photo of the vinyl surface and sleeve for accurate grading
                </p>
                {error && (
                  <p className="text-red-400 text-sm mb-4">{error}</p>
                )}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleCapture}
                    className="rounded-xl bg-white px-6 py-3 font-medium text-black active:scale-95"
                  >
                    Take Photo
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl bg-white/10 px-6 py-3 font-medium text-white active:scale-95"
                  >
                    Choose Photo
                  </button>
                </div>
              </div>
            )}

            {/* Loading step */}
            {step === "loading" && (
              <div className="flex flex-col items-center py-10">
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 80 80"
                  className="mb-4"
                  style={{ animation: "spin-vinyl 2s linear infinite" }}
                >
                  <circle cx="40" cy="40" r="38" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
                  <circle cx="40" cy="40" r="24" fill="none" stroke="#2a2a2a" strokeWidth="0.5" />
                  <circle cx="40" cy="40" r="12" fill="none" stroke="#333" strokeWidth="0.5" />
                  <circle cx="40" cy="40" r="6" fill="#333" stroke="#444" strokeWidth="1" />
                  <circle cx="40" cy="40" r="2" fill="#666" />
                </svg>
                <p className="text-white/60 text-sm">Analyzing condition...</p>
              </div>
            )}

            {/* Results step */}
            {step === "results" && grade && (
              <div className="py-4">
                <div className="flex items-center justify-center gap-4 mb-5">
                  <div className="text-center">
                    <p className="text-xs text-white/40 mb-1.5">Media</p>
                    <ConditionBadge grade={grade.mediaGrade} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-white/40 mb-1.5">Sleeve</p>
                    <ConditionBadge grade={grade.sleeveGrade} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-white/40 mb-1.5">Confidence</p>
                    <span className={`text-sm font-medium ${
                      grade.confidence === 'high' ? 'text-emerald-400' :
                      grade.confidence === 'medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {grade.confidence}
                    </span>
                  </div>
                </div>

                {grade.notes.length > 0 && (
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-xs text-white/40 mb-2">Notes</p>
                    <ul className="space-y-1.5">
                      {grade.notes.map((note, i) => (
                        <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                          <span className="text-white/30 mt-0.5">·</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleClose}
                  className="mt-5 w-full rounded-xl bg-white/10 py-3 font-medium text-white active:scale-95"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
