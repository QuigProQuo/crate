const API_BASE = process.env.CRATE_API_URL ?? 'http://localhost:3001';
const API_KEY = process.env.CRATE_API_KEY ?? '';

export async function POST(request: Request) {
  try {
    const res = await fetch(`${API_BASE}/v1/identify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': request.headers.get('Content-Type')!,
      },
      body: request.body,
      signal: AbortSignal.timeout(30_000),
    });

    return new Response(res.body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === 'TimeoutError'
        ? 'Identification timed out. Please try again.'
        : 'Unable to reach identification service.';
    return Response.json({ error: message }, { status: 502 });
  }
}
