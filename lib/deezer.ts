import type { TrackPreview } from '@/lib/types';

interface DeezerAlbumSearchResult {
  data: { id: number }[];
}

interface DeezerTrack {
  title: string;
  preview: string;
  duration: number;
}

interface DeezerTracksResponse {
  data: DeezerTrack[];
}

export async function searchAlbumPreviews(
  artist: string,
  album: string
): Promise<TrackPreview[]> {
  const query = `artist:"${artist}" album:"${album}"`;
  const searchUrl = `https://api.deezer.com/search/album?q=${encodeURIComponent(query)}`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) return [];

  const searchData: DeezerAlbumSearchResult = await searchRes.json();
  if (!searchData.data?.length) return [];

  const albumId = searchData.data[0].id;
  const tracksUrl = `https://api.deezer.com/album/${albumId}/tracks`;
  const tracksRes = await fetch(tracksUrl);
  if (!tracksRes.ok) return [];

  const tracksData: DeezerTracksResponse = await tracksRes.json();
  return (tracksData.data ?? []).map((track) => ({
    title: track.title,
    previewUrl: track.preview || null,
    duration: track.duration,
  }));
}
