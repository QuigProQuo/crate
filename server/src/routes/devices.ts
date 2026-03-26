import { Hono } from 'hono';
import { requireAuth, type AuthVariables } from '../middleware/auth';
import * as devices from '../db/queries/devices';
import * as history from '../db/queries/history';

const app = new Hono<{ Variables: AuthVariables }>();

// POST /register
app.post('/register', async (c) => {
  const { deviceUuid } = await c.req.json<{ deviceUuid: string }>();

  if (!deviceUuid) {
    return c.json({ error: 'Missing deviceUuid' }, 400);
  }

  const device = devices.register(deviceUuid);
  console.log(`[devices] registered | uuid=${deviceUuid}`);
  return c.json(device);
});

// POST /merge
app.post('/merge', requireAuth, async (c) => {
  const userId = c.get('userId')!;
  const { deviceUuid } = await c.req.json<{ deviceUuid: string }>();

  if (!deviceUuid) {
    return c.json({ error: 'Missing deviceUuid' }, 400);
  }

  devices.linkToUser(deviceUuid, userId);
  history.mergeDeviceToUser(deviceUuid, userId);

  console.log(`[devices] merged | uuid=${deviceUuid} | userId=${userId}`);
  return c.json({ ok: true });
});

export default app;
