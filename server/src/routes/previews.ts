import { Hono } from 'hono';
import { searchAlbumPreviews } from '../services/previews';

const app = new Hono();

app.get('/', async (c) => {
  const artist = c.req.query('artist');
  const album = c.req.query('album');

  if (!artist || !album) {
    return c.json({ error: 'Missing artist or album query parameter' }, 400);
  }

  const tracks = await searchAlbumPreviews(artist, album);
  return c.json({ tracks });
});

export default app;
