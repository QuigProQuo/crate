"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );

  useEffect(() => {
    let cancelled = false;
    let mediaStream: MediaStream | null = null;

    async function init() {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        setStream(mediaStream);
        setIsReady(true);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "NotAllowedError") {
          setError(
            "Camera access denied. Please allow camera permissions in your browser settings and reload."
          );
        } else {
          setError("Unable to access camera. Please check your device.");
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      mediaStream?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode]);

  const toggleTorch = useCallback(async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    try {
      const next = !torchOn;
      await track.applyConstraints({
        advanced: [{ torch: next } as MediaTrackConstraintSet],
      });
      setTorchOn(next);
    } catch {
      // Torch not supported on this device/browser
    }
  }, [stream, torchOn]);

  const flipCamera = useCallback(() => {
    // Stop current stream
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsReady(false);
    setTorchOn(false);
    // Toggle facing mode — useEffect will re-initialize
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, [stream]);

  const capturePhoto = useCallback((): Blob | null => {
    const video = videoRef.current;
    if (!video || !stream) return null;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return null;

    const maxDim = 1024;
    const scale = Math.min(maxDim / Math.max(vw, vh), 1);
    const cw = Math.round(vw * scale);
    const ch = Math.round(vh * scale);

    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, cw, ch);

    // toBlob is async — use synchronous toDataURL fallback for immediate return
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    const binary = atob(dataUrl.split(",")[1]);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      arr[i] = binary.charCodeAt(i);
    }
    return new Blob([arr], { type: "image/jpeg" });
  }, [stream]);

  return {
    videoRef,
    stream,
    error,
    isReady,
    capturePhoto,
    torchOn,
    toggleTorch,
    flipCamera,
  };
}
