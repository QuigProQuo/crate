"use client";

interface TopBarProps {
  torchOn: boolean;
  onTorchToggle: () => void;
  onFlipCamera: () => void;
  onHistoryOpen: () => void;
}

export function TopBar({
  torchOn,
  onTorchToggle,
  onFlipCamera,
  onHistoryOpen,
}: TopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-14 pb-3">
      {/* App name pill */}
      <div className="rounded-full bg-white/10 backdrop-blur-md px-4 py-1.5">
        <span className="text-sm font-semibold tracking-widest text-white/90">
          CRATE
        </span>
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
      </div>
    </div>
  );
}
