"use client";

interface ScanOverlayProps {
  visible: boolean;
}

export function ScanOverlay({ visible }: ScanOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-10 pointer-events-none">
      <p className="absolute top-16 left-0 right-0 text-center text-white/70 text-sm font-medium">
        Point at a record
      </p>
      <div className="absolute bottom-32 left-8 right-8 h-px overflow-hidden">
        <div
          className="h-full w-full bg-green-400/60"
          style={{ animation: "scan-line 3s ease-in-out infinite" }}
        />
      </div>
    </div>
  );
}
