import type { RecordInfo } from '@/lib/types';

const DISCOGS_KEY = process.env.DISCOGS_CONSUMER_KEY!;
const DISCOGS_SECRET = process.env.DISCOGS_CONSUMER_SECRET!;

const headers = {
  'User-Agent': 'Crate/1.0',
};

interface DiscogsSearchResult {
  id: number;
  resource_url: string;
}

interface DiscogsSearchResponse {
  results: DiscogsSearchResult[];
}

interface DiscogsTrack {
  position: string;
  title: string;
  duration: string;
}

interface DiscogsRelease {
  id: number;
  title: string;
  artists: { name: string }[];
  year: number;
  labels: { name: string }[];
  genres: string[];
  images?: { uri: string; type: string }[];
  tracklist: DiscogsTrack[];
}

function normalizeRelease(release: DiscogsRelease): RecordInfo {
  return {
    id: release.id,
    title: release.title,
    artist: release.artists?.map((a) => a.name).join(', ') ?? 'Unknown',
    year: release.year ?? 0,
    label: release.labels?.[0]?.name ?? 'Unknown',
    genres: release.genres ?? [],
    coverImage: release.images?.[0]?.uri ?? '',
    tracklist: (release.tracklist ?? []).map((t) => ({
      position: t.position,
      title: t.title,
      duration: t.duration,
    })),
  };
}

async function fetchRelease(resourceUrl: string): Promise<RecordInfo | null> {
  const url = `${resourceUrl}?key=${DISCOGS_KEY}&secret=${DISCOGS_SECRET}`;
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  const release: DiscogsRelease = await res.json();
  return normalizeRelease(release);
}

export async function searchByBarcode(
  barcode: string
): Promise<RecordInfo | null> {
  const url = `https://api.discogs.com/database/search?barcode=${encodeURIComponent(barcode)}&key=${DISCOGS_KEY}&secret=${DISCOGS_SECRET}`;
  const res = await fetch(url, { headers });
  if (!res.ok) return null;

  const data: DiscogsSearchResponse = await res.json();
  if (!data.results?.length) return null;

  return fetchRelease(data.results[0].resource_url);
}

export async function searchByText(
  query: string
): Promise<RecordInfo | null> {
  const url = `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release&key=${DISCOGS_KEY}&secret=${DISCOGS_SECRET}`;
  const res = await fetch(url, { headers });
  if (!res.ok) return null;

  const data: DiscogsSearchResponse = await res.json();
  if (!data.results?.length) return null;

  return fetchRelease(data.results[0].resource_url);
}
