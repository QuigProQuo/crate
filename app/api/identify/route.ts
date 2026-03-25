import { identifyRecord } from '@/lib/claude-vision';

const VALID_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

export async function POST(request: Request) {
  const start = Date.now();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    console.warn('[identify] invalid content-type, expected multipart/form-data');
    return Response.json({ error: 'multipart/form-data required' }, { status: 400 });
  }

  const image = formData.get('image') as File | null;

  if (!image) {
    console.warn('[identify] missing image field');
    return Response.json({ error: 'image field required' }, { status: 400 });
  }

  const buffer = await image.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mediaType = VALID_TYPES.has(image.type) ? image.type : 'image/jpeg';
  const sizeKb = Math.round(buffer.byteLength / 1024);

  console.log(`[identify] start | ${mediaType} | ${sizeKb}KB`);

  try {
    const identification = await identifyRecord(base64, mediaType);
    console.log(`[identify] ok | ${identification.artist} - ${identification.album} (${identification.confidence}) | ${Date.now() - start}ms`);
    return Response.json(identification);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Identification failed';
    console.error(`[identify] error | ${message} | ${Date.now() - start}ms`, err);
    return Response.json({ error: message }, { status: 500 });
  }
}
