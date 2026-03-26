import { identifyRecord } from '@/lib/claude-vision';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return Response.json({ error: 'No image provided.' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mediaType = file.type || 'image/jpeg';

    const result = await identifyRecord(base64, mediaType);

    return Response.json(result);
  } catch (err) {
    console.error('[identify] failed', err);
    return Response.json(
      { error: 'Could not identify the record. Please try again.' },
      { status: 500 },
    );
  }
}
