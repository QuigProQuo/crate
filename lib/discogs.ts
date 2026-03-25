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
  lowest_price?: number;
  num_for_sale?: number;
  community?: { have: number; want: number };
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
    lowestPrice: release.lowest_price,
    numForSale: release.num_for_sale,
    haveCount: release.community?.have,
    wantCount: release.community?.want,
  };
}

async function fetchRelease(resourceUrl: string): Promise<RecordInfo | null> {
  const url = `${resourceUrl}?key=${DISCOGS_KEY}&secret=${DISCOGS_SECRET}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error(`[discogs] release fetch failed | ${res.status} ${res.statusText} | ${resourceUrl}`);
    return null;
  }
  const release: DiscogsRelease = await res.json();
  return normalizeRelease(release);
}

export async function searchByBarcode(
  barcode: string
): Promise<RecordInfo | null> {
  const url = `https://api.discogs.com/database/search?barcode=${encodeURIComponent(barcode)}&key=${DISCOGS_KEY}&secret=${DISCOGS_SECRET}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error(`[discogs] barcode search failed | ${res.status} ${res.statusText} | barcode=${barcode}`);
    return null;
  }

  const data: DiscogsSearchResponse = await res.json();
  if (!data.results?.length) {
    console.warn(`[discogs] no results | barcode=${barcode}`);
    return null;
  }

  console.log(`[discogs] barcode hit | ${data.results.length} results | barcode=${barcode}`);
  return fetchRelease(data.results[0].resource_url);
}

export async function searchByText(
  query: string
): Promise<RecordInfo | null> {
  const url = `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release&key=${DISCOGS_KEY}&secret=${DISCOGS_SECRET}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error(`[discogs] text search failed | ${res.status} ${res.statusText} | query=${query}`);
    return null;
  }

  const data: DiscogsSearchResponse = await res.json();
  if (!data.results?.length) {
    console.warn(`[discogs] no results | query=${query}`);
    return null;
  }

  console.log(`[discogs] text hit | ${data.results.length} results | query=${query}`);
  return fetchRelease(data.results[0].resource_url);
}
