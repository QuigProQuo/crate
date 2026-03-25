const API_BASE = process.env.CRATE_API_URL ?? 'http://localhost:3001';
const API_KEY = process.env.CRATE_API_KEY ?? '';

export async function POST(request: Request) {
  const res = await fetch(`${API_BASE}/v1/grade`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': request.headers.get('Content-Type')!,
    },
    body: request.body,
  });

  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
