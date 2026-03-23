"use client";

import type { RecordInfo } from "@/lib/types";

interface PriceSectionProps {
  record: RecordInfo;
}

export function PriceSection({ record }: PriceSectionProps) {
  const { lowestPrice, numForSale, haveCount, wantCount } = record;

  // Don't render if no pricing data
  if (!lowestPrice && !numForSale && !haveCount) return null;

  // Demand indicator: high want:have ratio = green
  const demandRatio = haveCount && wantCount ? wantCount / haveCount : 0;
  const demandColor =
    demandRatio > 0.5
      ? "text-emerald-400"
      : demandRatio > 0.2
        ? "text-yellow-400"
        : "text-white/50";

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {lowestPrice != null && (
        <div className="rounded-xl bg-white/5 px-3 py-2.5 text-center">
          <p className="text-lg font-semibold text-emerald-400">
            ${lowestPrice.toFixed(2)}
          </p>
          <p className="text-xs text-white/40 mt-0.5">Lowest</p>
        </div>
      )}
      {numForSale != null && numForSale > 0 && (
        <div className="rounded-xl bg-white/5 px-3 py-2.5 text-center">
          <p className="text-lg font-semibold text-white/80">{numForSale}</p>
          <p className="text-xs text-white/40 mt-0.5">For Sale</p>
        </div>
      )}
      {haveCount != null && wantCount != null && (
        <div className="rounded-xl bg-white/5 px-3 py-2.5 text-center">
          <p className={`text-lg font-semibold ${demandColor}`}>
            {wantCount}
          </p>
          <p className="text-xs text-white/40 mt-0.5">
            Want · {haveCount} have
          </p>
        </div>
      )}
    </div>
  );
}
