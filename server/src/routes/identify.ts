import { Hono } from 'hono';
import { identifyRecord } from '../services/claude';

const app = new Hono();

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

app.post('/', async (c) => {
  const start = Date.now();
  console.log('[identify] start');

  try {
    const body = await c.req.parseBody();
    const image = body['image'];

    if (!image || !(image instanceof File)) {
      return c.json({ error: 'Missing image field' }, 400);
    }

    const mimeType = ALLOWED_TYPES.has(image.type) ? image.type : 'image/jpeg';
    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const result = await identifyRecord(base64, mimeType);

    console.log(`[identify] ok | artist=${result.artist} | album=${result.album} | ${Date.now() - start}ms`);
    return c.json(result);
  } catch (err: any) {
    console.error(`[identify] error | ${err.message} | ${Date.now() - start}ms`);
    return c.json({ error: 'Identification failed' }, 500);
  }
});

export default app;
