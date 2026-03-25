import { gradeCondition } from '@/lib/claude-grade';

const VALID_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

export async function POST(request: Request) {
  const start = Date.now();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    console.warn('[grade] invalid content-type, expected multipart/form-data');
    return Response.json({ error: 'multipart/form-data required' }, { status: 400 });
  }

  const image = formData.get('image') as File | null;

  if (!image) {
    console.warn('[grade] missing image field');
    return Response.json({ error: 'image field required' }, { status: 400 });
  }

  const buffer = await image.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mediaType = VALID_TYPES.has(image.type) ? image.type : 'image/jpeg';
  const sizeKb = Math.round(buffer.byteLength / 1024);

  console.log(`[grade] start | ${mediaType} | ${sizeKb}KB`);

  try {
    const grade = await gradeCondition(base64, mediaType);
    console.log(`[grade] ok | media=${grade.mediaGrade} sleeve=${grade.sleeveGrade} (${grade.confidence}) | ${Date.now() - start}ms`);
    return Response.json(grade);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Grading failed';
    console.error(`[grade] error | ${message} | ${Date.now() - start}ms`, err);
    return Response.json({ error: message }, { status: 500 });
  }
}
