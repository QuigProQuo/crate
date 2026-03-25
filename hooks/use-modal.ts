"use client";

import { useEffect, useRef } from "react";

/**
 * Handles ESC-to-close and basic focus trapping for modals.
 * Returns a ref to attach to the modal container (which needs tabIndex={-1}).
 */
export function useModal(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save the currently focused element so we can restore it on close
      previousFocusRef.current = document.activeElement;

      // Focus the modal container
      setTimeout(() => containerRef.current?.focus(), 0);
    } else if (previousFocusRef.current) {
      // Restore focus to the previously focused element
      (previousFocusRef.current as HTMLElement).focus?.();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return containerRef;
}
