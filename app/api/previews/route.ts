import * as appleMusic from '@/lib/apple-music';
import { searchAlbumPreviews as deezerSearch } from '@/lib/deezer';
import type { TrackPreview } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');
  const album = searchParams.get('album');

  if (!artist || !album) {
    return Response.json({ tracks: [] });
  }

  let tracks: TrackPreview[] = [];

  // Try Apple Music first (if configured)
  if (appleMusic.isConfigured()) {
    try {
      tracks = await appleMusic.searchAlbumPreviews(artist, album);
    } catch (err) {
      console.error('[previews] apple-music threw', err);
    }
  }

  // Fall back to Deezer
  if (!tracks.length) {
    try {
      tracks = await deezerSearch(artist, album);
    } catch (err) {
      console.error('[previews] deezer threw', err);
    }
  }

  return Response.json({ tracks });
}
