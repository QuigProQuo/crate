"use client";

interface AudioPlayerProps {
  previewUrl: string;
  isActive: boolean;
  isPlaying: boolean;
  onToggle: () => void;
}

export function AudioPlayer({
  isActive,
  isPlaying,
  onToggle,
}: AudioPlayerProps) {
  const showPause = isActive && isPlaying;

  return (
    <button
      onClick={onToggle}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
        isActive && isPlaying
          ? "bg-green-500/20 text-green-400"
          : "bg-white/10 text-white/70"
      }`}
      style={
        showPause
          ? { animation: "pulse-ring 2s ease-in-out infinite" }
          : undefined
      }
      aria-label={showPause ? "Pause" : "Play"}
    >
      {showPause ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <polygon points="6,4 20,12 6,20" />
        </svg>
      )}
    </button>
  );
}
