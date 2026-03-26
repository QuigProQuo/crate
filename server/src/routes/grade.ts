import { Hono } from 'hono';
import { gradeCondition } from '../services/claude';

const app = new Hono();

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

app.post('/', async (c) => {
  const start = Date.now();
  console.log('[grade] start');

  try {
    const body = await c.req.parseBody();
    const image = body['image'];

    if (!image || !(image instanceof File)) {
      return c.json({ error: 'Missing image field' }, 400);
    }

    const mimeType = ALLOWED_TYPES.has(image.type) ? image.type : 'image/jpeg';
    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const result = await gradeCondition(base64, mimeType);

    console.log(`[grade] ok | media=${result.mediaGrade} sleeve=${result.sleeveGrade} | ${Date.now() - start}ms`);
    return c.json(result);
  } catch (err: any) {
    console.error(`[grade] error | ${err.message} | ${Date.now() - start}ms`);
    return c.json({ error: 'Grading failed' }, 500);
  }
});

export default app;
