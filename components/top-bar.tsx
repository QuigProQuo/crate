"use client";

interface TopBarProps {
  torchOn: boolean;
  onTorchToggle: () => void;
  onFlipCamera: () => void;
  onHistoryOpen: () => void;
  batchMode: boolean;
  onBatchToggle: () => void;
  batchCount: number;
  onHelpOpen: () => void;
}

export function TopBar({
  torchOn,
  onTorchToggle,
  onFlipCamera,
  onHistoryOpen,
  batchMode,
  onBatchToggle,
  batchCount,
  onHelpOpen,
}: TopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-14 pb-3">
      {/* App name pill + help */}
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5">
          <span className="text-sm font-semibold tracking-widest text-white/90">
            CRATE
          </span>
        </div>
        <button
          onClick={onHelpOpen}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-md active:scale-95"
          aria-label="How to use Crate"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
      </div>

      {/* Utility icons */}
      <div className="flex items-center gap-2">
        {/* Torch */}
        <button
          onClick={onTorchToggle}
          className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md active:scale-95 transition-colors ${
            torchOn ? "bg-yellow-400/25" : "bg-white/10"
          }`}
          aria-label="Toggle flashlight"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={torchOn ? "#facc15" : "none"}
            stroke={torchOn ? "#facc15" : "rgba(255,255,255,0.7)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </button>

        {/* Flip camera */}
        <button
          onClick={onFlipCamera}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md active:scale-95"
          aria-label="Flip camera"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 3h5v5" />
            <path d="M21 3l-7 7" />
            <path d="M8 21H3v-5" />
            <path d="M3 21l7-7" />
          </svg>
        </button>

        {/* History */}
        <button
          onClick={onHistoryOpen}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md active:scale-95"
          aria-label="Scan history"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>

        {/* Batch mode */}
        <button
          onClick={onBatchToggle}
          className={`relative flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md active:scale-95 transition-colors ${
            batchMode ? "bg-purple-400/25" : "bg-white/10"
          }`}
          aria-label="Toggle batch mode"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={batchMode ? "rgb(192,132,252)" : "rgba(255,255,255,0.7)"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 3H8l-2 4h12L16 3z" />
          </svg>
          {batchCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">
              {batchCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
