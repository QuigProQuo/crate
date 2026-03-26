const API_BASE = process.env.CRATE_API_URL ?? 'http://localhost:3001';
const API_KEY = process.env.CRATE_API_KEY ?? '';

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const body = await request.text();
  const res = await fetch(`${API_BASE}/v1/devices/${path.join('/')}`, {
    method: 'POST',
    headers: {
      'Authorization': request.headers.get('Authorization') || `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body,
  });
  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
