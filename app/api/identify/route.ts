import { identifyRecord } from '@/lib/claude-vision';

export async function POST(request: Request) {
  const formData = await request.formData();
  const image = formData.get('image') as File | null;

  if (!image) {
    return Response.json({ error: 'image field required' }, { status: 400 });
  }

  const buffer = await image.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mediaType = image.type || 'image/jpeg';

  try {
    const identification = await identifyRecord(base64, mediaType);
    return Response.json(identification);
  } catch (err) {
    console.error('Identify error:', err);
    const message = err instanceof Error ? err.message : 'Identification failed';
    return Response.json({ error: message }, { status: 500 });
  }
}
