"use client";

import { useCallback, useState } from "react";
import { CameraViewfinder } from "@/components/camera-viewfinder";
import { ScanOverlay } from "@/components/scan-overlay";
import { CaptureButton } from "@/components/capture-button";
import { LoadingState } from "@/components/loading-state";
import { ErrorToast } from "@/components/error-toast";
import { ResultsSheet } from "@/components/results-sheet";
import { SearchModal } from "@/components/search-modal";
import { useCamera } from "@/hooks/use-camera";
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner";
import { useRecordLookup } from "@/hooks/use-record-lookup";

export default function Home() {
  const { videoRef, stream, error: cameraError, capturePhoto } = useCamera();
  const { state, lookupByBarcode, lookupByPhoto, lookupBySearch, reset } =
    useRecordLookup();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleBarcodeDetected = useCallback(
    (barcode: string) => {
      if (state.status === "idle") {
        lookupByBarcode(barcode);
      }
    },
    [state.status, lookupByBarcode]
  );

  useBarcodeScanner(videoRef, handleBarcodeDetected, state.status === "idle");

  const handleCapture = useCallback(() => {
    const blob = capturePhoto();
    if (blob) {
      lookupByPhoto(blob);
    }
  }, [capturePhoto, lookupByPhoto]);

  const handleSearch = useCallback(
    (query: string) => {
      lookupBySearch(query);
    },
    [lookupBySearch]
  );

  const handleDismissError = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black">
      {/* Camera layer */}
      <CameraViewfinder
        videoRef={videoRef}
        stream={stream}
        error={cameraError}
      />

      {/* Scan overlay — visible when idle */}
      <ScanOverlay visible={state.status === "idle" && !cameraError} />

      {/* Capture + search buttons */}
      <CaptureButton
        onCapture={handleCapture}
        onSearchOpen={() => setSearchOpen(true)}
        disabled={state.status === "loading"}
      />

      {/* Loading overlay */}
      {state.status === "loading" && <LoadingState step={state.step} />}

      {/* Results bottom sheet */}
      {state.status === "results" && state.record && (
        <ResultsSheet
          record={state.record}
          previews={state.previews ?? []}
          onClose={reset}
        />
      )}

      {/* Error toast */}
      {state.status === "error" && state.error && (
        <ErrorToast
          message={state.error}
          onDismiss={handleDismissError}
        />
      )}

      {/* Search modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={handleSearch}
      />
    </main>
  );
}
