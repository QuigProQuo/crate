"use client";

import { useCallback, useState } from "react";
import type { LookupState } from "@/lib/types";

export function useRecordLookup() {
  const [state, setState] = useState<LookupState>({ status: "idle" });

  const lookupByBarcode = useCallback(async (barcode: string) => {
    try {
      setState({ status: "loading", step: "discogs" });

      const discogsRes = await fetch("/api/discogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode }),
      });

      if (!discogsRes.ok) {
        const data = await discogsRes.json().catch(() => ({}));
        setState({
          status: "error",
          error: data.error || "Record not found for this barcode.",
        });
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
      setState({ status: "error", error: "Something went wrong." });
    }
  }, []);

  const lookupByPhoto = useCallback(async (blob: Blob) => {
    try {
      setState({ status: "loading", step: "identify" });

      const formData = new FormData();
      formData.append("image", blob, "photo.jpg");

      const identifyRes = await fetch("/api/identify", {
        method: "POST",
        body: formData,
      });

      if (!identifyRes.ok) {
        setState({
          status: "error",
          error: "Could not identify the record from the photo.",
        });
        return;
      }

      const identification = await identifyRes.json();

      setState({ status: "loading", step: "discogs" });

      const discogsRes = await fetch("/api/discogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `${identification.artist} ${identification.album}`,
        }),
      });

      if (!discogsRes.ok) {
        setState({
          status: "error",
          error: "Record not found in database.",
        });
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
      setState({ status: "error", error: "Something went wrong." });
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
        const data = await discogsRes.json().catch(() => ({}));
        setState({
          status: "error",
          error: data.error || "No results found.",
        });
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
      setState({ status: "error", error: "Something went wrong." });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  return { state, lookupByBarcode, lookupByPhoto, lookupBySearch, reset };
}
