"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { CameraViewfinder } from "@/components/camera-viewfinder";
import { ScanOverlay } from "@/components/scan-overlay";
import { CaptureButton } from "@/components/capture-button";
import { TopBar } from "@/components/top-bar";
import { LoadingState } from "@/components/loading-state";
import { ErrorToast } from "@/components/error-toast";
import { ResultsSheet } from "@/components/results-sheet";
import { SearchModal } from "@/components/search-modal";
import { HistorySheet } from "@/components/history-sheet";
import { ARInfoCard } from "@/components/ar-info-card";
import { BatchStrip } from "@/components/batch-strip";
import { BatchSummary } from "@/components/batch-summary";
import { InstallPrompt } from "@/components/install-prompt";
import { Onboarding } from "@/components/onboarding";
import { useCamera } from "@/hooks/use-camera";
import { useBarcodeScanner } from "@/hooks/use-barcode-scanner";
import { useRecordLookup } from "@/hooks/use-record-lookup";
import { useScanHistory } from "@/hooks/use-scan-history";
import { useBatchMode, type BatchItem } from "@/hooks/use-batch-mode";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useAuth } from "@/hooks/use-auth";
import { useCollection } from "@/hooks/use-collection";
import { LoginModal } from "@/components/login-modal";
import { AccountSheet } from "@/components/account-sheet";
import { CollectionSheet } from "@/components/collection-sheet";

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
  const { state, lookupByBarcode, lookupByPhoto, lookupBySearch, retry, reset } =
    useRecordLookup();
  const { history, addToHistory, updateGrade } = useScanHistory();
  const batch = useBatchMode();
  const audio = useAudioPlayer();
  const auth = useAuth();
  const collection = useCollection();
  const autoPlayedRef = useRef(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [batchSummaryOpen, setBatchSummaryOpen] = useState(false);
  const [showFullResults, setShowFullResults] = useState(false);
  const [batchToast, setBatchToast] = useState<string | null>(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);

  // Handle results: batch mode vs normal (AR card) flow
  useEffect(() => {
    if (state.status === "results" && state.record) {
      addToHistory(state.record);

      if (batch.enabled) {
        // Batch mode: add to queue, show toast, auto-reset
        batch.addToBatch(state.record, state.previews ?? []);
        setBatchToast(state.record.title);
        setTimeout(() => setBatchToast(null), 2000);
        reset();
      }
      // Non-batch: AR card shows automatically (showFullResults starts false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.record]);

  // Auto-play first preview when results arrive (AR card stage)
  useEffect(() => {
    if (state.status === "results" && state.previews && !autoPlayedRef.current) {
      const first = state.previews.find((p) => p.previewUrl);
      if (first?.previewUrl) {
        autoPlayedRef.current = true;
        audio.playWhenReady(first.previewUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status, state.previews]);

  // Reset full results view when going back to idle
  useEffect(() => {
    if (state.status === "idle") {
      setShowFullResults(false);
      autoPlayedRef.current = false;
    }
  }, [state.status]);

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
    // If results are showing (AR card or full sheet), dismiss first so user can see the camera
    if (state.status === "results") {
      audio.stop();
      reset();
      return;
    }
    const blob = capturePhoto();
    if (blob) {
      audio.prime(); // Unlock audio on user gesture so auto-play works when results arrive
      lookupByPhoto(blob);
    }
  }, [capturePhoto, lookupByPhoto, audio, state.status, reset]);

  const handleFilePick = useCallback(
    (file: File) => {
      if (showFullResults) audio.stop();
      lookupByPhoto(file);
    },
    [lookupByPhoto, audio, showFullResults]
  );

  const handleSearch = useCallback(
    (query: string) => {
      if (showFullResults) audio.stop();
      lookupBySearch(query);
    },
    [lookupBySearch, audio, showFullResults]
  );

  const handleHistorySelect = useCallback(
    (record: { artist: string; title: string }) => {
      lookupBySearch(`${record.artist} ${record.title}`);
    },
    [lookupBySearch]
  );

  const handleBatchSelect = useCallback(
    (item: BatchItem) => {
      // Re-lookup the selected batch item to get full results with previews
      lookupBySearch(`${item.record.artist} ${item.record.title}`);
    },
    [lookupBySearch]
  );

  const handleDismiss = useCallback(() => {
    audio.stop();
    reset();
  }, [reset, audio]);

  const isResults = state.status === "results" && state.record;

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-black">
      {/* Camera layer */}
      <CameraViewfinder
        videoRef={videoRef}
        stream={stream}
        error={cameraError}
      />

      {/* Top bar */}
      <TopBar
        torchOn={torchOn}
        onTorchToggle={toggleTorch}
        onFlipCamera={flipCamera}
        onHistoryOpen={() => setHistoryOpen(true)}
        batchMode={batch.enabled}
        onBatchToggle={batch.toggleBatch}
        batchCount={batch.items.length}
        onHelpOpen={() => setOnboardingOpen(true)}
        onAccountOpen={() => setAccountOpen(true)}
        isLoggedIn={auth.isLoggedIn}
      />

      {/* Corner brackets viewfinder */}
      <ScanOverlay visible={state.status === "idle" && !cameraError} />

      {/* Batch thumbnail strip */}
      {batch.items.length > 0 && (
        <BatchStrip
          items={batch.items}
          onSelect={handleBatchSelect}
          onSummaryOpen={() => setBatchSummaryOpen(true)}
        />
      )}

      {/* Bottom bar */}
      <CaptureButton
        onCapture={handleCapture}
        onSearchOpen={() => {
          if (showFullResults) {
            audio.stop();
            reset();
          }
          setSearchOpen(true);
        }}
        onFilePick={handleFilePick}
        disabled={state.status === "loading"}
      />

      {/* Loading overlay */}
      {state.status === "loading" && <LoadingState step={state.step} />}

      {/* AR Info Card — shows first when results arrive (non-batch) */}
      <AnimatePresence>
        {isResults && !showFullResults && !batch.enabled && (
          <ARInfoCard
            record={state.record!}
            conditionGrade={state.conditionGrade}
            onExpand={() => setShowFullResults(true)}
            onDismiss={handleDismiss}
          />
        )}
      </AnimatePresence>

      {/* Full results sheet — after tapping AR card */}
      {isResults && showFullResults && (
        <ResultsSheet
          record={state.record!}
          previews={state.previews ?? []}
          onClose={handleDismiss}
          onCapturePhoto={capturePhoto}
          audio={audio}
          onGraded={(grade) => updateGrade(state.record!.id, grade)}
          collectionStatus={auth.isLoggedIn ? collection.getStatus(state.record!.id) : undefined}
          onHave={auth.isLoggedIn ? () => {
            const status = collection.getStatus(state.record!.id);
            if (status === 'have') collection.removeFromCollection(collection.getItem(state.record!.id)!.id);
            else collection.addToCollection(state.record!.id, 'have');
          } : undefined}
          onWant={auth.isLoggedIn ? () => {
            const status = collection.getStatus(state.record!.id);
            if (status === 'want') collection.removeFromCollection(collection.getItem(state.record!.id)!.id);
            else collection.addToCollection(state.record!.id, 'want');
          } : undefined}
        />
      )}

      {/* Batch confirmation toast */}
      {batchToast && (
        <div className="fixed top-24 left-4 right-4 z-50 flex items-center gap-3 rounded-xl bg-purple-500/20 backdrop-blur-md px-4 py-3 border border-purple-500/30">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(192,132,252)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <p className="text-sm text-purple-200 truncate">
            Added: {batchToast}
          </p>
        </div>
      )}

      {/* Error toast */}
      {state.status === "error" && state.error && (
        <ErrorToast
          message={state.error}
          onDismiss={handleDismiss}
          onRetry={state.retryable ? retry : undefined}
        />
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

      {/* iOS install prompt */}
      <InstallPrompt />

      {/* Batch summary */}
      <BatchSummary
        isOpen={batchSummaryOpen}
        items={batch.items}
        onClose={() => setBatchSummaryOpen(false)}
        onSelect={handleBatchSelect}
        onRemove={batch.removeFromBatch}
        onClear={batch.clearBatch}
      />

      {/* Login modal */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={auth.login}
        onVerify={auth.verify}
        onSuccess={() => {
          setLoginOpen(false);
          collection.refresh();
        }}
      />

      {/* Account sheet */}
      <AccountSheet
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        user={auth.user}
        onOpenLogin={() => {
          setAccountOpen(false);
          setLoginOpen(true);
        }}
        onSignOut={async () => {
          await auth.logout();
          setAccountOpen(false);
        }}
        onOpenCollection={() => {
          setAccountOpen(false);
          setCollectionOpen(true);
        }}
      />

      {/* Collection sheet */}
      <CollectionSheet
        isOpen={collectionOpen}
        onClose={() => setCollectionOpen(false)}
        items={collection.items}
        onSelect={(item) => {
          setCollectionOpen(false);
          lookupBySearch(`${item.artist} ${item.title}`);
        }}
      />

      {/* Onboarding walkthrough */}
      <Onboarding open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
    </main>
  );
}
