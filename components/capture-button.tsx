"use client";

interface CaptureButtonProps {
  onCapture: () => void;
  onSearchOpen: () => void;
  disabled: boolean;
}

export function CaptureButton({
  onCapture,
  onSearchOpen,
  disabled,
}: CaptureButtonProps) {
  const handleCapture = () => {
    if (disabled) return;
    navigator.vibrate?.(50);
    onCapture();
  };

  const handleSearch = () => {
    navigator.vibrate?.(50);
    onSearchOpen();
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex items-center justify-center gap-6">
      <button
        onClick={handleCapture}
        disabled={disabled}
        className={`flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur-sm transition-opacity active:scale-95 ${
          disabled ? "opacity-50" : ""
        }`}
        aria-label="Capture photo"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="13" r="4" />
          <path d="M9 2L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3.17L15 2H9z" />
        </svg>
      </button>

      <button
        onClick={handleSearch}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm active:scale-95"
        aria-label="Search"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    </div>
  );
}
