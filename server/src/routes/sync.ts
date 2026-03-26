import { Hono } from 'hono';
import { requireAuth, requireAuthOrDevice, type AuthVariables } from '../middleware/auth';
import * as history from '../db/queries/history';
import * as records from '../db/queries/records';
import * as collection from '../db/queries/collection';

const app = new Hono<{ Variables: AuthVariables }>();

// GET /history
app.get('/history', requireAuthOrDevice, async (c) => {
  const userId = c.get('userId');
  const deviceId = c.get('deviceId');
  const since = c.req.query('since');
  const limit = parseInt(c.req.query('limit') ?? '50');

  let rows: any[];
  if (userId) {
    rows = history.findByUser(userId, limit);
  } else {
    rows = history.findByDevice(deviceId!, limit);
  }

  // Filter by since if provided
  if (since) {
    const sinceTs = parseInt(since);
    rows = rows.filter((r: any) => r.scanned_at > sinceTs);
  }

  return c.json({ entries: rows });
});

// POST /history
app.post('/history', requireAuthOrDevice, async (c) => {
  const userId = c.get('userId');
  const deviceId = c.get('deviceId');
  const { entries } = await c.req.json<{ entries: any[] }>();

  if (!entries || !Array.isArray(entries)) {
    return c.json({ error: 'Missing entries array' }, 400);
  }

  const results = [];
  for (const entry of entries) {
    // Upsert record if provided
    if (entry.record) {
      const r = entry.record;
      records.upsert({
        discogs_id: r.id ?? r.discogs_id,
        title: r.title,
        artist: r.artist,
        year: r.year,
        label: r.label,
        genres: typeof r.genres === 'string' ? r.genres : JSON.stringify(r.genres),
        cover_image: r.coverImage ?? r.cover_image,
        tracklist: typeof r.tracklist === 'string' ? r.tracklist : JSON.stringify(r.tracklist),
        lowest_price: r.lowestPrice ?? r.lowest_price,
        num_for_sale: r.numForSale ?? r.num_for_sale,
        have_count: r.haveCount ?? r.have_count,
        want_count: r.wantCount ?? r.want_count,
      });
    }

    const row = history.add({
      device_uuid: deviceId,
      user_id: userId,
      discogs_id: entry.discogsId ?? entry.discogs_id,
      scanned_at: entry.scannedAt ?? entry.scanned_at ?? Math.floor(Date.now() / 1000),
      media_grade: entry.mediaGrade ?? entry.media_grade,
      sleeve_grade: entry.sleeveGrade ?? entry.sleeve_grade,
      grade_confidence: entry.gradeConfidence ?? entry.grade_confidence,
      grade_notes: entry.gradeNotes ?? entry.grade_notes,
    });
    results.push(row);
  }

  return c.json({ entries: results });
});

// DELETE /history/:id
app.delete('/history/:id', requireAuth, async (c) => {
  const userId = c.get('userId')!;
  const id = c.req.param('id');

  const row = history.deleteById(id);
  if (!row || row.user_id !== userId) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json({ ok: true });
});

// GET /collection
app.get('/collection', requireAuth, async (c) => {
  const userId = c.get('userId')!;
  const status = c.req.query('status') as 'have' | 'want' | undefined;

  const items = collection.findByUser(userId, status);
  return c.json({ items });
});

// POST /collection
app.post('/collection', requireAuth, async (c) => {
  const userId = c.get('userId')!;
  const body = await c.req.json<{
    discogsId: number;
    status: 'have' | 'want';
    notes?: string;
  }>();

  if (!body.discogsId || !body.status) {
    return c.json({ error: 'Missing discogsId or status' }, 400);
  }

  const item = collection.upsert({
    user_id: userId,
    discogs_id: body.discogsId,
    status: body.status,
    notes: body.notes,
  });

  return c.json(item);
});

// DELETE /collection/:id
app.delete('/collection/:id', requireAuth, async (c) => {
  const userId = c.get('userId')!;
  const id = c.req.param('id');

  const row = collection.deleteById(id);
  if (!row || row.user_id !== userId) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json({ ok: true });
});

export default app;
