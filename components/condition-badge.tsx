"use client";

import type { GoldmineGrade } from "@/lib/types";

interface ConditionBadgeProps {
  grade: GoldmineGrade;
  label?: string;
}

function gradeColor(grade: GoldmineGrade): string {
  switch (grade) {
    case "M":
    case "NM":
      return "bg-emerald-500/20 text-emerald-400";
    case "VG+":
    case "VG":
      return "bg-blue-500/20 text-blue-400";
    case "G+":
    case "G":
      return "bg-yellow-500/20 text-yellow-400";
    case "F":
    case "P":
      return "bg-red-500/20 text-red-400";
  }
}

export function ConditionBadge({ grade, label }: ConditionBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${gradeColor(grade)}`}
    >
      {label && <span className="text-white/40 font-normal">{label}</span>}
      {grade}
    </span>
  );
}
