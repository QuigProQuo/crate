const API_BASE = process.env.CRATE_API_URL ?? 'http://localhost:3001';
const API_KEY = process.env.CRATE_API_KEY ?? '';

export async function POST(request: Request) {
  try {
    const body = await request.arrayBuffer();

    const res = await fetch(`${API_BASE}/v1/grade`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': request.headers.get('Content-Type')!,
      },
      body,
      signal: AbortSignal.timeout(30_000),
    });

    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === 'TimeoutError'
        ? 'Grading timed out.'
        : 'Unable to reach grading service.';
    return Response.json({ error: message }, { status: 502 });
  }
}
