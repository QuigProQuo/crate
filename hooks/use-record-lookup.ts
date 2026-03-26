"use client";

import { useCallback, useRef, useState } from "react";
import type { ConditionGrade, LookupState } from "@/lib/types";

/** Extract a human-readable error from a failed response, falling back to a default. */
async function errorFrom(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (typeof body?.error === "string" && body.error.length > 0) return body.error;
  } catch {
    // body wasn't JSON — fall through
  }
  return fallback;
}

/** Fetch with a single retry on network / 5xx errors. */
async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  try {
    const res = await fetch(input, init);
    if (res.status >= 500) {
      // Clone the original init for retry — body streams can only be consumed once,
      // but FormData / JSON strings are re-readable via the caller passing a new body.
      throw new Error(`Server error ${res.status}`);
    }
    return res;
  } catch (firstErr) {
    // Single retry after a brief pause
    await new Promise((r) => setTimeout(r, 1_000));
    return fetch(input, init);
  }
}

export function useRecordLookup() {
  const [state, setState] = useState<LookupState>({ status: "idle" });

  // Keep a ref to the last photo blob so retry can re-send it
  const lastBlobRef = useRef<Blob | null>(null);

  const lookupByBarcode = useCallback(async (barcode: string) => {
    try {
      setState({ status: "loading", step: "discogs" });

      const discogsRes = await fetch("/api/discogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode }),
      });

      if (!discogsRes.ok) {
        const msg = await errorFrom(discogsRes, "Record not found for this barcode.");
        setState({ status: "error", error: msg });
        return;
      }

      const record = await discogsRes.json();

      setState({ status: "loading", step: "previews" });

      const params = new URLSearchParams({
        artist: record.artist,
        album: record.title,
      });
      const previewsRes = await fetch(`/api/previews?${params}`);
      const previewsData = previewsRes.ok ? await previewsRes.json() : { tracks: [] };
      const previews = previewsData.tracks ?? [];

      setState({ status: "results", record, previews });
    } catch {
      setState({ status: "error", error: "Something went wrong. Check your connection." });
    }
  }, []);

  const lookupByPhoto = useCallback(async (blob: Blob) => {
    lastBlobRef.current = blob;

    try {
      setState({ status: "loading", step: "identify" });

      // Build form data for each request (streams can only be consumed once)
      const makeIdentifyForm = () => {
        const fd = new FormData();
        fd.append("image", blob, "photo.jpg");
        return fd;
      };
      const makeGradeForm = () => {
        const fd = new FormData();
        fd.append("image", blob, "photo.jpg");
        return fd;
      };

      // Fire identify and grade in parallel
      const [identifyResult, gradeResult] = await Promise.allSettled([
        fetchWithRetry("/api/identify", { method: "POST", body: makeIdentifyForm() }),
        fetch("/api/grade", { method: "POST", body: makeGradeForm() }),
      ]);

      // --- Handle identify failure with specific messaging ---
      if (identifyResult.status === "rejected") {
        const reason = identifyResult.reason;
        const isTimeout =
          reason instanceof DOMException && reason.name === "TimeoutError";
        setState({
          status: "error",
          error: isTimeout
            ? "Identification timed out. Please try again."
            : "Could not reach the server. Check your connection.",
          retryable: true,
        });
        return;
      }

      const identifyRes = identifyResult.value;

      if (!identifyRes.ok) {
        const msg = await errorFrom(
          identifyRes,
          identifyRes.status === 502
            ? "Identification service is temporarily unavailable."
            : "Could not identify the record from the photo. Try a clearer angle.",
        );
        setState({ status: "error", error: msg, retryable: true });
        return;
      }

      const identification = await identifyRes.json();

      // Validate that we got usable identification data
      if (!identification.artist && !identification.album) {
        setState({
          status: "error",
          error: "Could not identify the record. Try getting closer to the cover art.",
          retryable: true,
        });
        return;
      }

      // Parse grade if available (non-blocking)
      let conditionGrade: ConditionGrade | undefined;
      if (gradeResult.status === "fulfilled" && gradeResult.value.ok) {
        try {
          conditionGrade = await gradeResult.value.json();
        } catch {
          // Grading JSON parse failed — not critical, continue without it
        }
      }

      setState({ status: "loading", step: "discogs" });

      const discogsRes = await fetch("/api/discogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `${identification.artist} ${identification.album}`,
        }),
      });

      if (!discogsRes.ok) {
        const msg = await errorFrom(discogsRes, "Record not found in database.");
        setState({ status: "error", error: msg });
        return;
      }

      const record = await discogsRes.json();

      setState({ status: "loading", step: "previews" });

      const params = new URLSearchParams({
        artist: record.artist,
        album: record.title,
      });
      const previewsRes = await fetch(`/api/previews?${params}`);
      const previewsData = previewsRes.ok ? await previewsRes.json() : { tracks: [] };
      const previews = previewsData.tracks ?? [];

      setState({ status: "results", record, previews, conditionGrade });
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      setState({
        status: "error",
        error: isAbort
          ? "Request was cancelled."
          : "Something went wrong. Check your connection and try again.",
        retryable: true,
      });
    }
  }, []);

  const lookupBySearch = useCallback(async (query: string) => {
    try {
      setState({ status: "loading", step: "discogs" });

      const discogsRes = await fetch("/api/discogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!discogsRes.ok) {
        const msg = await errorFrom(discogsRes, "No results found.");
        setState({ status: "error", error: msg });
        return;
      }

      const record = await discogsRes.json();

      setState({ status: "loading", step: "previews" });

      const params = new URLSearchParams({
        artist: record.artist,
        album: record.title,
      });
      const previewsRes = await fetch(`/api/previews?${params}`);
      const previewsData = previewsRes.ok ? await previewsRes.json() : { tracks: [] };
      const previews = previewsData.tracks ?? [];

      setState({ status: "results", record, previews });
    } catch {
      setState({ status: "error", error: "Something went wrong. Check your connection." });
    }
  }, []);

  const retry = useCallback(() => {
    if (lastBlobRef.current) {
      lookupByPhoto(lastBlobRef.current);
    }
  }, [lookupByPhoto]);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, lookupByBarcode, lookupByPhoto, lookupBySearch, retry, reset };
}
