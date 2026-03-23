import { searchAlbumPreviews } from '@/lib/deezer';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artist = searchParams.get('artist');
  const album = searchParams.get('album');

  if (!artist || !album) {
    return Response.json(
      { error: 'artist and album params required' },
      { status: 400 }
    );
  }

  const tracks = await searchAlbumPreviews(artist, album);
  return Response.json({ tracks });
}
