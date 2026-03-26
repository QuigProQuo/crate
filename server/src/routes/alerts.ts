import { Hono } from 'hono';
import { requireAuth, type AuthVariables } from '../middleware/auth';
import * as alerts from '../db/queries/alerts';
import * as notifications from '../db/queries/notifications';

const app = new Hono<{ Variables: AuthVariables }>();

// GET /
app.get('/', requireAuth, async (c) => {
  const userId = c.get('userId')!;
  const items = alerts.findByUser(userId);
  return c.json({ alerts: items });
});

// POST /
app.post('/', requireAuth, async (c) => {
  const userId = c.get('userId')!;
  const { discogsId, threshold } = await c.req.json<{
    discogsId: number;
    threshold: number;
  }>();

  if (!discogsId || threshold == null) {
    return c.json({ error: 'Missing discogsId or threshold' }, 400);
  }

  const alert = alerts.create({
    user_id: userId,
    discogs_id: discogsId,
    threshold,
  });

  console.log(`[alerts] created | userId=${userId} | discogsId=${discogsId} | threshold=${threshold}`);
  return c.json(alert);
});

// DELETE /:id
app.delete('/:id', requireAuth, async (c) => {
  const userId = c.get('userId')!;
  const id = c.req.param('id');

  const row = alerts.deleteById(id);
  if (!row || row.user_id !== userId) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json({ ok: true });
});

// GET /notifications
app.get('/notifications', requireAuth, async (c) => {
  const userId = c.get('userId')!;
  const unreadOnly = c.req.query('unread') === 'true';
  const items = notifications.findByUser(userId, unreadOnly);
  return c.json({ notifications: items });
});

// POST /notifications/:id/read
app.post('/notifications/:id/read', requireAuth, async (c) => {
  const id = c.req.param('id');
  const result = notifications.markRead(id);
  if (!result) {
    return c.json({ error: 'Not found' }, 404);
  }
  return c.json({ ok: true });
});

export default app;
