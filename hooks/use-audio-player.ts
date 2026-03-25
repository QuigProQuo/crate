"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const primedRef = useRef(false);
  const pendingUrlRef = useRef<string | null>(null);
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

  // Call from a user gesture (capture tap) to unlock audio on iOS/Safari.
  // Plays a silent moment so the browser marks this Audio element as
  // user-activated — subsequent play() calls work without a gesture.
  const prime = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || primedRef.current) return;
    audio.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      primedRef.current = true;
    }).catch(() => {});
  }, []);

  // Queue a URL to auto-play once available (called when previews arrive).
  // If audio is already primed, plays immediately.
  const playWhenReady = useCallback(
    (url: string) => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.src = url;
      audio.load();
      setCurrentTrackUrl(url);
      setProgress(0);
      audio.play().then(() => setIsPlaying(true)).catch(() => {
        // Browser blocked it — store as pending so next user tap triggers it
        pendingUrlRef.current = url;
      });
    },
    []
  );

  const play = useCallback(
    (url: string) => {
      const audio = audioRef.current;
      if (!audio) return;

      pendingUrlRef.current = null;

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
    primedRef.current = false;
    pendingUrlRef.current = null;
    setIsPlaying(false);
    setCurrentTrackUrl(null);
    setProgress(0);
  }, []);

  return { currentTrackUrl, isPlaying, progress, play, pause, stop, prime, playWhenReady };
}
