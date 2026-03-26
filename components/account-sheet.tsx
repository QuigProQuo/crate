"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useModal } from "@/hooks/use-modal";

interface AccountSheetProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; email: string; displayName: string } | null;
  onSignOut: () => Promise<void>;
  onOpenLogin: () => void;
  onOpenCollection?: () => void;
}

export function AccountSheet({ isOpen, onClose, user, onSignOut, onOpenLogin, onOpenCollection }: AccountSheetProps) {
  const modalRef = useModal(isOpen, onClose);

  const handleSignOut = async () => {
    await onSignOut();
    onClose();
  };

  const handleSignIn = () => {
    onClose();
    onOpenLogin();
  };

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
          onClick={onClose}
        >
          <motion.div
            className="rounded-t-2xl bg-zinc-900/95 px-5 pb-10 pt-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-3">
              <div className="h-1 w-10 rounded-full bg-white/30" />
            </div>

            <h3 className="text-lg font-semibold text-white mb-5">Account</h3>

            {user ? (
              <div>
                <div className="rounded-xl bg-white/5 p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <span className="text-sm font-medium text-white">
                        {(user.displayName || user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      {user.displayName && (
                        <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                      )}
                      <p className="text-sm text-white/50 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                {onOpenCollection && (
                  <button
                    onClick={() => { onClose(); onOpenCollection(); }}
                    className="w-full rounded-xl bg-white/5 p-4 mb-4 text-left active:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span className="text-sm text-white/70">My Collection</span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </button>
                )}

                <div className="rounded-xl bg-white/5 p-4 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <p className="text-sm text-white/60">Collection synced</p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full rounded-xl bg-white/10 py-3 text-sm font-medium text-white active:scale-[0.98] transition-transform"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-white/50 mb-5">
                  Sign in to sync your collection and access it on any device.
                </p>
                <button
                  onClick={handleSignIn}
                  className="w-full rounded-xl bg-white py-3 font-medium text-black active:scale-95"
                >
                  Sign In
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
