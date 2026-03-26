"use client";

interface CollectionButtonsProps {
  discogsId: number;
  currentStatus: "have" | "want" | null;
  onHave: () => void;
  onWant: () => void;
}

export function CollectionButtons({
  currentStatus,
  onHave,
  onWant,
}: CollectionButtonsProps) {
  const isHave = currentStatus === "have";
  const isWant = currentStatus === "want";

  return (
    <div className="flex gap-2">
      <button
        onClick={onHave}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          isHave
            ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
            : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={isHave ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Have
      </button>
      <button
        onClick={onWant}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          isWant
            ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40"
            : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={isWant ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        Want
      </button>
    </div>
  );
}
