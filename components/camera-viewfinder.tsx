"use client";

import { useEffect, type RefObject } from "react";

interface CameraViewfinderProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  error: string | null;
}

export function CameraViewfinder({
  videoRef,
  stream,
  error,
}: CameraViewfinderProps) {
  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;
    }
  }, [videoRef, stream]);

  if (error) {
    return (
      <div className="fixed inset-0 z-0 flex items-center justify-center bg-black px-8">
        <p className="text-center text-white/70 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className="fixed inset-0 z-0 h-full w-full object-cover"
      autoPlay
      playsInline
      muted
    />
  );
}
