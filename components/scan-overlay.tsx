"use client";

interface ScanOverlayProps {
  visible: boolean;
}

export function ScanOverlay({ visible }: ScanOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex items-center justify-center">
      {/* Corner brackets */}
      <div
        className="relative w-72 h-72"
        style={{ animation: "bracket-pulse 2.5s ease-in-out infinite" }}
      >
        {/* Top-left */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-white/60 rounded-tl-lg" />
        {/* Top-right */}
        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-white/60 rounded-tr-lg" />
        {/* Bottom-left */}
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-white/60 rounded-bl-lg" />
        {/* Bottom-right */}
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-white/60 rounded-br-lg" />
      </div>

      {/* Hint text below brackets */}
      <p className="absolute bottom-36 left-0 right-0 text-center text-white/50 text-sm font-medium">
        Point at a record
      </p>
    </div>
  );
}
