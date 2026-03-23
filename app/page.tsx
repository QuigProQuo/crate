"use client";

import { useCallback, useEffect, useState } from "react";
import { CameraViewfinder } from "@/components/camera-viewfinder";
import { ScanOverlay } from "@/components/scan-overlay";
import { CaptureButton } from "@/components/capture-button";
import { TopBar } from "@/components/top-bar";
import { LoadingState } from "@/components/loading-state";
import { ErrorToast } from "@/components/error-toast";
import { ResultsSheet } from "@/components/results-sheet";
import { SearchModal } from "@/components/search-modal";
import { HistorySheet } from "@/components/history-sheet";
import { useCamera } from "@/hooks/use-camera";
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner";
import { useRecordLookup } from "@/hooks/use-record-lookup";
import { useScanHistory } from "@/hooks/use-scan-history";

export default function Home() {
  const {
    videoRef,
    stream,
    error: cameraError,
    capturePhoto,
    torchOn,
    toggleTorch,
    flipCamera,
  } = useCamera();
  const { state, lookupByBarcode, lookupByPhoto, lookupBySearch, reset } =
    useRecordLookup();
  const { history, addToHistory } = useScanHistory();
  const [searchOpen, setSearchOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Save to history when results arrive
  useEffect(() => {
    if (state.status === "results" && state.record) {
      addToHistory(state.record);
    }
  }, [state.status, state.record, addToHistory]);

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

  const handleFilePick = useCallback(
    (file: File) => {
      lookupByPhoto(file);
    },
    [lookupByPhoto]
  );

  const handleSearch = useCallback(
    (query: string) => {
      lookupBySearch(query);
    },
    [lookupBySearch]
  );

  const handleHistorySelect = useCallback(
    (record: typeof state.record) => {
      if (!record) return;
      // Re-fetch previews for the selected record
      lookupBySearch(`${record.artist} ${record.title}`);
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

      {/* Top bar — app name + utility icons */}
      <TopBar
        torchOn={torchOn}
        onTorchToggle={toggleTorch}
        onFlipCamera={flipCamera}
        onHistoryOpen={() => setHistoryOpen(true)}
      />

      {/* Corner brackets viewfinder */}
      <ScanOverlay visible={state.status === "idle" && !cameraError} />

      {/* Bottom bar — gallery, shutter, search */}
      <CaptureButton
        onCapture={handleCapture}
        onSearchOpen={() => setSearchOpen(true)}
        onFilePick={handleFilePick}
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
        <ErrorToast message={state.error} onDismiss={handleDismissError} />
      )}

      {/* Search modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={handleSearch}
      />

      {/* History sheet */}
      <HistorySheet
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelect={handleHistorySelect}
      />
    </main>
  );
}
