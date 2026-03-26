const API_BASE = process.env.CRATE_API_URL ?? 'http://localhost:3001';
const API_KEY = process.env.CRATE_API_KEY ?? '';

export async function POST(request: Request) {
  try {
    const res = await fetch(`${API_BASE}/v1/discogs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: request.body,
      signal: AbortSignal.timeout(15_000),
    });

    return new Response(res.body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === 'TimeoutError'
        ? 'Database lookup timed out.'
        : 'Unable to reach database service.';
    return Response.json({ error: message }, { status: 502 });
  }
}
