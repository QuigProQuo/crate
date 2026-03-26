"use client";

import type { TrackInfo, TrackPreview } from "@/lib/types";
import { AudioPlayer } from "@/components/audio-player";

interface TrackListProps {
  tracks: TrackInfo[];
  previews: TrackPreview[];
  currentTrackUrl: string | null;
  isPlaying: boolean;
  onPlay: (url: string) => void;
}

/** Strip parenthetical suffixes like "(Alternate Take)" or "(Studio Sequence 1)" */
function baseTitle(s: string): string {
  return s.toLowerCase().replace(/\s*\(.*\)\s*$/, "").trim();
}

function findPreview(
  track: TrackInfo,
  previews: TrackPreview[]
): TrackPreview | undefined {
  const title = baseTitle(track.title);

  // Prefer exact base-title match (ignoring parentheticals)
  const exact = previews.find(
    (p) => p.previewUrl && baseTitle(p.title) === title
  );
  if (exact) return exact;

  // Fall back to substring match
  return previews.find(
    (p) =>
      p.previewUrl &&
      (baseTitle(p.title).includes(title) ||
        title.includes(baseTitle(p.title)))
  );
}

export function TrackList({
  tracks,
  previews,
  currentTrackUrl,
  isPlaying,
  onPlay,
}: TrackListProps) {
  return (
    <div className="flex flex-col">
      {tracks.map((track, i) => {
        const preview = findPreview(track, previews);
        const hasPreview = !!preview?.previewUrl;
        const isActive = hasPreview && currentTrackUrl === preview.previewUrl;

        return (
          <div
            key={`${track.position}-${i}`}
            className={`flex items-center gap-3 px-1 py-2.5 ${
              isActive ? "bg-white/5 rounded-lg" : ""
            } ${!hasPreview ? "opacity-50" : ""}`}
          >
            <span className="w-8 shrink-0 text-right text-xs text-white/40 font-mono">
              {track.position}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{track.title}</p>
              {track.duration && (
                <p className="text-xs text-white/40">{track.duration}</p>
              )}
            </div>
            {hasPreview && preview.previewUrl && (
              <AudioPlayer
                previewUrl={preview.previewUrl}
                isActive={!!isActive}
                isPlaying={!!isActive && isPlaying}
                onToggle={() => onPlay(preview.previewUrl!)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
