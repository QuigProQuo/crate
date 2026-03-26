const API_BASE = process.env.CRATE_API_URL ?? 'http://localhost:3001';
const API_KEY = process.env.CRATE_API_KEY ?? '';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    const artist = searchParams.get('artist');
    const album = searchParams.get('album');
    if (artist) params.set('artist', artist);
    if (album) params.set('album', album);

    const res = await fetch(`${API_BASE}/v1/previews?${params}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
      signal: AbortSignal.timeout(10_000),
    });

    return new Response(res.body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return Response.json({ tracks: [] }, { status: 200 });
  }
}
