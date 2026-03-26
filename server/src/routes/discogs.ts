import { Hono } from 'hono';
import { searchByBarcode, searchByText } from '../services/discogs';
import * as records from '../db/queries/records';

const app = new Hono();

app.post('/', async (c) => {
  const start = Date.now();
  console.log('[discogs] start');

  try {
    const { barcode, query } = await c.req.json<{ barcode?: string; query?: string }>();

    if (!barcode && !query) {
      return c.json({ error: 'Provide barcode or query' }, 400);
    }

    const result = barcode
      ? await searchByBarcode(barcode)
      : await searchByText(query!);

    if (!result) {
      console.log(`[discogs] no results | ${Date.now() - start}ms`);
      return c.json({ error: 'No results found' }, 404);
    }

    // Upsert into records table
    records.upsert({
      discogs_id: result.id,
      title: result.title,
      artist: result.artist,
      year: result.year,
      label: result.label,
      genres: JSON.stringify(result.genres),
      cover_image: result.coverImage,
      tracklist: JSON.stringify(result.tracklist),
      lowest_price: result.lowestPrice,
      num_for_sale: result.numForSale,
      have_count: result.haveCount,
      want_count: result.wantCount,
    });

    console.log(`[discogs] ok | id=${result.id} | ${result.artist} - ${result.title} | ${Date.now() - start}ms`);
    return c.json(result);
  } catch (err: any) {
    console.error(`[discogs] error | ${err.message} | ${Date.now() - start}ms`);
    return c.json({ error: 'Search failed' }, 500);
  }
});

export default app;
