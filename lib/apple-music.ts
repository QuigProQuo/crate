import { SignJWT, importPKCS8 } from 'jose';
import type { TrackPreview } from '@/lib/types';

const TEAM_ID = process.env.APPLE_MUSIC_TEAM_ID ?? '';
const KEY_ID = process.env.APPLE_MUSIC_KEY_ID ?? '';
const PRIVATE_KEY = (process.env.APPLE_MUSIC_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');

const API_BASE = 'https://api.music.apple.com/v1/catalog/us';

interface AppleMusicSearchResponse {
  results: {
    albums?: {
      data: { id: string; attributes: { name: string } }[];
    };
  };
}

interface AppleMusicAlbumResponse {
  data: {
    relationships: {
      tracks: {
        data: {
          attributes: {
            name: string;
            durationInMillis: number;
            previews: { url: string }[];
          };
        }[];
      };
    };
  }[];
}

let cachedToken: { jwt: string; expiresAt: number } | null = null;

export function isConfigured(): boolean {
  return !!(TEAM_ID && KEY_ID && PRIVATE_KEY);
}

async function getDevToken(): Promise<string | null> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    console.log('[apple-music] using cached token');
    return cachedToken.jwt;
  }

  try {
    const key = await importPKCS8(PRIVATE_KEY, 'ES256');
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 15_777_000; // ~6 months

    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: 'ES256', kid: KEY_ID })
      .setIssuer(TEAM_ID)
      .setIssuedAt(now)
      .setExpirationTime(exp)
      .sign(key);

    cachedToken = { jwt, expiresAt: exp * 1000 };
    console.log('[apple-music] token generated');
    return jwt;
  } catch (err) {
    console.error('[apple-music] token generation failed', err);
    return null;
  }
}

export async function searchAlbumPreviews(
  artist: string,
  album: string
): Promise<TrackPreview[]> {
  const token = await getDevToken();
  if (!token) return [];

  const term = `${artist} ${album}`;
  const searchUrl = `${API_BASE}/search?types=albums&term=${encodeURIComponent(term)}&limit=5`;
  const headers = { Authorization: `Bearer ${token}` };

  const searchRes = await fetch(searchUrl, { headers });
  if (!searchRes.ok) {
    console.error(`[apple-music] search failed | ${searchRes.status} | ${artist} - ${album}`);
    return [];
  }

  const searchData: AppleMusicSearchResponse = await searchRes.json();
  const albums = searchData.results.albums?.data;
  if (!albums?.length) {
    console.warn(`[apple-music] no album found | ${artist} - ${album}`);
    return [];
  }

  const albumId = albums[0].id;
  const albumUrl = `${API_BASE}/albums/${albumId}?include=tracks`;
  const albumRes = await fetch(albumUrl, { headers });
  if (!albumRes.ok) {
    console.error(`[apple-music] album fetch failed | ${albumRes.status} | albumId=${albumId}`);
    return [];
  }

  const albumData: AppleMusicAlbumResponse = await albumRes.json();
  const trackData = albumData.data?.[0]?.relationships?.tracks?.data ?? [];
  const tracks: TrackPreview[] = trackData.map((track) => ({
    title: track.attributes.name,
    previewUrl: track.attributes.previews?.[0]?.url ?? null,
    duration: Math.round(track.attributes.durationInMillis / 1000),
  }));

  console.log(`[apple-music] ok | albumId=${albumId} | ${tracks.length} tracks`);
  return tracks;
}
