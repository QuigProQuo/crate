import type { TrackPreview } from '../types';

interface DeezerTrack {
  title: string;
  preview: string;
  duration: number;
}

interface DeezerAlbumResult {
  id: number;
  title: string;
  artist: { name: string };
}

interface DeezerSearchResponse {
  data?: DeezerAlbumResult[];
}

interface DeezerTracksResponse {
  data?: DeezerTrack[];
}

export async function searchAlbumPreviews(artist: string, album: string): Promise<TrackPreview[]> {
  try {
    const query = encodeURIComponent(`artist:"${artist}" album:"${album}"`);
    const searchRes = await fetch(`https://api.deezer.com/search/album?q=${query}&limit=1`);
    const searchData = (await searchRes.json()) as DeezerSearchResponse;

    if (!searchData.data?.length) {
      console.log(`[previews] no Deezer results for "${artist}" - "${album}"`);
      return [];
    }

    const albumId = searchData.data[0].id;
    console.log(`[previews] found Deezer album ${albumId} for "${artist}" - "${album}"`);

    const tracksRes = await fetch(`https://api.deezer.com/album/${albumId}/tracks`);
    const tracksData = (await tracksRes.json()) as DeezerTracksResponse;

    if (!tracksData.data?.length) {
      console.log(`[previews] no tracks found for album ${albumId}`);
      return [];
    }

    return tracksData.data.map((track) => ({
      title: track.title,
      previewUrl: track.preview || null,
      duration: track.duration,
    }));
  } catch (err) {
    console.error('[previews] error fetching from Deezer:', err);
    return [];
  }
}
