"use client";

import { useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import type { RecordInfo, TrackPreview, ConditionGrade } from "@/lib/types";
import { TrackList } from "@/components/track-list";
import { PriceSection } from "@/components/price-section";
import { ConditionBadge } from "@/components/condition-badge";
import { ConditionModal } from "@/components/condition-modal";

interface AudioPlayer {
  currentTrackUrl: string | null;
  isPlaying: boolean;
  play: (url: string) => void;
}

interface ResultsSheetProps {
  record: RecordInfo;
  previews: TrackPreview[];
  onClose: () => void;
  onCapturePhoto: () => Blob | null;
  audio: AudioPlayer;
}

export function ResultsSheet({ record, previews, onClose, onCapturePhoto, audio }: ResultsSheetProps) {
  const { currentTrackUrl, isPlaying, play } = audio;
  const [gradingOpen, setGradingOpen] = useState(false);
  const [conditionGrade, setConditionGrade] = useState<ConditionGrade | null>(null);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 150) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-x-0 bottom-0 z-30 max-h-[90vh] rounded-t-3xl bg-zinc-900/95 backdrop-blur-xl shadow-2xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-white/30" />
        </div>

        <div className="overflow-y-auto px-6 pb-36" style={{ maxHeight: "calc(90vh - 20px)" }}>
          {/* Album cover */}
          {record.coverImage && (
            <div className="flex justify-center mb-4">
              <img
                src={record.coverImage}
                alt={`${record.title} cover`}
                className="w-48 h-48 rounded-xl object-cover shadow-lg"
              />
            </div>
          )}

          {/* Title & artist */}
          <h2 className="text-xl font-bold text-white text-center">
            {record.title}
          </h2>
          <p className="text-lg text-white/70 text-center mt-1">
            {record.artist}
          </p>

          {/* Metadata */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-white/50">
            {record.year > 0 && <span>{record.year}</span>}
            {record.year > 0 && record.label && <span>·</span>}
            {record.label && <span>{record.label}</span>}
            {record.genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/60"
              >
                {genre}
              </span>
            ))}
          </div>

          <PriceSection record={record} />

          {/* Condition grading */}
          <div className="mt-4 flex items-center gap-3">
            {conditionGrade ? (
              <div className="flex items-center gap-2">
                <ConditionBadge grade={conditionGrade.mediaGrade} label="Media" />
                <ConditionBadge grade={conditionGrade.sleeveGrade} label="Sleeve" />
              </div>
            ) : (
              <button
                onClick={() => setGradingOpen(true)}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/70 active:scale-95"
              >
                Grade Condition
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="my-5 h-px bg-white/10" />

          {/* Track list */}
          {record.tracklist.length > 0 && (
            <TrackList
              tracks={record.tracklist}
              previews={previews}
              currentTrackUrl={currentTrackUrl}
              isPlaying={isPlaying}
              onPlay={play}
            />
          )}
        </div>

        <ConditionModal
          isOpen={gradingOpen}
          onClose={() => setGradingOpen(false)}
          onCapturePhoto={onCapturePhoto}
          onGraded={setConditionGrade}
        />
      </motion.div>
    </AnimatePresence>
  );
}
