"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrackUrl, setCurrentTrackUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
    };
  }, []);

  const play = useCallback(
    (url: string) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (url === currentTrackUrl && isPlaying) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      if (url !== currentTrackUrl) {
        audio.src = url;
        audio.load();
        setCurrentTrackUrl(url);
        setProgress(0);
      }

      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    },
    [currentTrackUrl, isPlaying]
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = "";
    }
    setIsPlaying(false);
    setCurrentTrackUrl(null);
    setProgress(0);
  }, []);

  return { currentTrackUrl, isPlaying, progress, play, pause, stop };
}
