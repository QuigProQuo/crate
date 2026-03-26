const API_BASE = process.env.CRATE_API_URL ?? 'http://localhost:3001';
const API_KEY = process.env.CRATE_API_KEY ?? '';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = new URL(request.url);
  const res = await fetch(`${API_BASE}/v1/sync/${path.join('/')}${url.search}`, {
    headers: {
      'Authorization': request.headers.get('Authorization') || `Bearer ${API_KEY}`,
      'X-Device-Id': request.headers.get('X-Device-Id') || '',
    },
  });
  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const res = await fetch(`${API_BASE}/v1/sync/${path.join('/')}`, {
    method: 'POST',
    headers: {
      'Authorization': request.headers.get('Authorization') || `Bearer ${API_KEY}`,
      'X-Device-Id': request.headers.get('X-Device-Id') || '',
      'Content-Type': 'application/json',
    },
    body: request.body,
    // @ts-expect-error duplex required for streaming body in Node 18+
    duplex: 'half',
  });
  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const res = await fetch(`${API_BASE}/v1/sync/${path.join('/')}`, {
    method: 'DELETE',
    headers: {
      'Authorization': request.headers.get('Authorization') || `Bearer ${API_KEY}`,
    },
  });
  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
