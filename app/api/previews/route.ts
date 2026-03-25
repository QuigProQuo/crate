import { searchAlbumPreviews } from '@/lib/deezer';

export async function GET(request: Request) {
  const start = Date.now();
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');
  const album = searchParams.get('album');

  if (!artist || !album) {
    console.warn('[previews] missing artist or album params');
    return Response.json(
      { error: 'artist and album params required' },
      { status: 400 }
    );
  }

  console.log(`[previews] start | ${artist} - ${album}`);

  try {
    const tracks = await searchAlbumPreviews(artist, album);
    const withPreview = tracks.filter((t) => t.previewUrl).length;
    console.log(`[previews] ok | ${tracks.length} tracks, ${withPreview} with previews | ${Date.now() - start}ms`);
    return Response.json({ tracks });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Preview lookup failed';
    console.error(`[previews] error | ${artist} - ${album} | ${message} | ${Date.now() - start}ms`, err);
    return Response.json({ tracks: [] });
  }
}
