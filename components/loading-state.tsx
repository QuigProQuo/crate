"use client";

interface LoadingStateProps {
  step?: string;
}

function stepLabel(step?: string): string {
  switch (step) {
    case "identify":
      return "Identifying...";
    case "discogs":
      return "Searching database...";
    case "previews":
      return "Loading previews...";
    default:
      return "Loading...";
  }
}

export function LoadingState({ step }: LoadingStateProps) {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        className="mb-6"
        style={{ animation: "spin-vinyl 2s linear infinite" }}
      >
        <circle cx="40" cy="40" r="38" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
        <circle cx="40" cy="40" r="30" fill="none" stroke="#2a2a2a" strokeWidth="0.5" />
        <circle cx="40" cy="40" r="24" fill="none" stroke="#2a2a2a" strokeWidth="0.5" />
        <circle cx="40" cy="40" r="18" fill="none" stroke="#2a2a2a" strokeWidth="0.5" />
        <circle cx="40" cy="40" r="12" fill="none" stroke="#333" strokeWidth="0.5" />
        <circle cx="40" cy="40" r="6" fill="#333" stroke="#444" strokeWidth="1" />
        <circle cx="40" cy="40" r="2" fill="#666" />
      </svg>
      <p className="text-white/80 text-lg font-medium">{stepLabel(step)}</p>
    </div>
  );
}
