"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModal } from "@/hooks/use-modal";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string) => Promise<void>;
  onVerify: (email: string, code: string) => Promise<void>;
  onSuccess: () => void;
}

type Step = "email" | "code";

export function LoginModal({ isOpen, onClose, onLogin, onVerify, onSuccess }: LoginModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleClose = useCallback(() => {
    setStep("email");
    setEmail("");
    setCode(["", "", "", "", "", ""]);
    setError(null);
    setSubmitting(false);
    onClose();
  }, [onClose]);

  const modalRef = useModal(isOpen, handleClose);

  // Focus email input when modal opens
  useEffect(() => {
    if (isOpen && step === "email") {
      setTimeout(() => emailInputRef.current?.focus(), 100);
    }
  }, [isOpen, step]);

  // Focus first code input when entering code step
  useEffect(() => {
    if (step === "code") {
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError(null);
    try {
      await onLogin(trimmed);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCodeChange = async (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    const fullCode = next.join("");
    if (fullCode.length === 6 && next.every((d) => d !== "")) {
      setSubmitting(true);
      setError(null);
      try {
        await onVerify(email.trim(), fullCode);
        onSuccess();
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid code");
        setCode(["", "", "", "", "", ""]);
        setTimeout(() => codeRefs.current[0]?.focus(), 50);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setCode(next);
    if (pasted.length === 6) {
      // Auto-submit
      handleCodeChange(5, pasted[5]);
    } else {
      codeRefs.current[pasted.length]?.focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm outline-none px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl bg-zinc-900/95 px-6 py-8"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {step === "email" && (
              <>
                <h3 className="text-lg font-semibold text-white mb-2">Sign In</h3>
                <p className="text-sm text-white/50 mb-6">
                  Sign in to sync your collection across devices.
                </p>

                <form onSubmit={handleEmailSubmit}>
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full rounded-xl bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-white/30 mb-4"
                    autoComplete="email"
                    disabled={submitting}
                  />

                  {error && (
                    <p className="text-red-400 text-sm mb-3">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !email.trim()}
                    className="w-full rounded-xl bg-white py-3 font-medium text-black active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                  >
                    {submitting ? "Sending..." : "Send Code"}
                  </button>
                </form>

                <button
                  onClick={handleClose}
                  className="mt-4 w-full text-center text-sm text-white/40 active:text-white/60"
                >
                  or continue without account
                </button>
              </>
            )}

            {step === "code" && (
              <>
                <h3 className="text-lg font-semibold text-white mb-2">Enter Code</h3>
                <p className="text-sm text-white/50 mb-6">
                  We sent a 6-digit code to {email.trim()}
                </p>

                <div className="flex justify-center gap-2 mb-4" onPaste={handleCodePaste}>
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { codeRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      disabled={submitting}
                      className="h-12 w-10 rounded-lg bg-white/10 text-center text-lg font-mono text-white outline-none ring-1 ring-white/10 focus:ring-white/40 disabled:opacity-50"
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-red-400 text-sm text-center mb-3">{error}</p>
                )}

                {submitting && (
                  <p className="text-white/40 text-sm text-center mb-3">Verifying...</p>
                )}

                <button
                  onClick={() => {
                    setStep("email");
                    setCode(["", "", "", "", "", ""]);
                    setError(null);
                  }}
                  className="mt-2 w-full text-center text-sm text-white/40 active:text-white/60"
                >
                  Use a different email
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
