"use client";

import { useEffect, useRef, useCallback } from "react";
import type { RefObject } from "react";

export function useBarcodeScanner(
  videoRef: RefObject<HTMLVideoElement | null>,
  onDetected: (barcode: string) => void,
  enabled: boolean
) {
  const lastDetected = useRef<{ code: string; time: number }>({
    code: "",
    time: 0,
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onDetectedRef = useRef(onDetected);
  onDetectedRef.current = onDetected;

  const hasBarcodeDetector =
    typeof globalThis !== "undefined" && "BarcodeDetector" in globalThis;

  const detectWithBarcodeAPI = useCallback(
    async (canvas: HTMLCanvasElement): Promise<string | null> => {
      if (!hasBarcodeDetector) return null;
      try {
        // @ts-expect-error BarcodeDetector is not in all TS libs
        const detector = new BarcodeDetector({
          formats: ["ean_13", "upc_a", "upc_e", "ean_8"],
        });
        const barcodes = await detector.detect(canvas);
        if (barcodes.length > 0) {
          return barcodes[0].rawValue;
        }
      } catch {
        // fallback
      }
      return null;
    },
    [hasBarcodeDetector]
  );

  const detectWithHtml5Qrcode = useCallback(
    async (canvas: HTMLCanvasElement): Promise<string | null> => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const dataUrl = canvas.toDataURL("image/png");
        // Create a temporary file from data URL
        const blob = await fetch(dataUrl).then((r) => r.blob());
        const file = new File([blob], "frame.png", { type: "image/png" });
        const html5Qr = new Html5Qrcode("__barcode-scanner-temp");

        // Create temporary element if not exists
        if (!document.getElementById("__barcode-scanner-temp")) {
          const div = document.createElement("div");
          div.id = "__barcode-scanner-temp";
          div.style.display = "none";
          document.body.appendChild(div);
        }

        const result = await html5Qr.scanFile(file, false);
        html5Qr.clear();
        return result || null;
      } catch {
        return null;
      }
    },
    []
  );

  useEffect(() => {
    if (!enabled) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }

    let rafId: number;
    let lastCheck = 0;
    const INTERVAL = 500;

    async function checkFrame() {
      const now = Date.now();
      if (now - lastCheck < INTERVAL) {
        rafId = requestAnimationFrame(checkFrame);
        return;
      }
      lastCheck = now;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafId = requestAnimationFrame(checkFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafId = requestAnimationFrame(checkFrame);
        return;
      }

      ctx.drawImage(video, 0, 0);

      let code: string | null = null;

      if (hasBarcodeDetector) {
        code = await detectWithBarcodeAPI(canvas);
      }

      if (!code) {
        code = await detectWithHtml5Qrcode(canvas);
      }

      if (code) {
        const last = lastDetected.current;
        if (code !== last.code || now - last.time > 5000) {
          lastDetected.current = { code, time: now };
          onDetectedRef.current(code);
        }
      }

      rafId = requestAnimationFrame(checkFrame);
    }

    rafId = requestAnimationFrame(checkFrame);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [
    enabled,
    videoRef,
    hasBarcodeDetector,
    detectWithBarcodeAPI,
    detectWithHtml5Qrcode,
  ]);
}
