import { Hono } from 'hono';
import * as jose from 'jose';
import { env } from '../env';
import { requireAuth, type AuthVariables } from '../middleware/auth';
import * as users from '../db/queries/users';
import * as devices from '../db/queries/devices';
import { sendMagicLinkEmail } from '../services/mailer';
import { verifyAppleToken } from '../services/apple-auth';
import db from '../db/index';

const app = new Hono<{ Variables: AuthVariables }>();

const secret = new TextEncoder().encode(env.JWT_SECRET);

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(): string {
  return crypto.randomUUID();
}

async function issueTokens(userId: string, deviceUuid?: string) {
  const sessionToken = generateToken();
  const refreshToken = generateToken();

  const accessExp = Math.floor(Date.now() / 1000) + 15 * 60; // 15 min
  const refreshExp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days

  const accessToken = await new jose.SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setJti(sessionToken)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret);

  // Store session
  db.prepare(
    'INSERT INTO sessions (token, user_id, device_uuid, expires_at) VALUES (?, ?, ?, ?)'
  ).run(sessionToken, userId, deviceUuid ?? null, refreshExp);

  // Store refresh token as a separate session entry
  db.prepare(
    'INSERT INTO sessions (token, user_id, device_uuid, expires_at) VALUES (?, ?, ?, ?)'
  ).run(refreshToken, userId, deviceUuid ?? null, refreshExp);

  return { accessToken, refreshToken, expiresIn: 900 };
}

// POST /magic-link
app.post('/magic-link', async (c) => {
  const { email } = await c.req.json<{ email: string }>();

  if (!email || !email.includes('@')) {
    return c.json({ error: 'Invalid email' }, 400);
  }

  const code = generateCode();
  const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60; // 10 min

  db.prepare(
    'INSERT INTO magic_links (email, code, expires_at) VALUES (?, ?, ?)'
  ).run(email.toLowerCase(), code, expiresAt);

  const sent = await sendMagicLinkEmail(email.toLowerCase(), code);
  if (!sent) {
    return c.json({ error: 'Failed to send email' }, 500);
  }

  console.log(`[auth] magic-link sent | email=${email.toLowerCase()}`);
  return c.json({ ok: true });
});

// POST /verify
app.post('/verify', async (c) => {
  const { email, code } = await c.req.json<{ email: string; code: string }>();
  const deviceId = c.get('deviceId');

  if (!email || !code) {
    return c.json({ error: 'Missing email or code' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const link = db.prepare(
    'SELECT * FROM magic_links WHERE email = ? AND code = ? AND used = 0 AND expires_at > ? ORDER BY created_at DESC LIMIT 1'
  ).get(email.toLowerCase(), code, now) as any;

  if (!link) {
    return c.json({ error: 'Invalid or expired code' }, 401);
  }

  // Mark as used
  db.prepare('UPDATE magic_links SET used = 1 WHERE id = ?').run(link.id);

  // Find or create user
  let user = users.findByEmail(email.toLowerCase());
  if (!user) {
    user = users.create({ email: email.toLowerCase() });
  }

  // Auto-merge device if deviceId provided
  if (deviceId) {
    devices.linkToUser(deviceId, user.id);
    // Merge scan history
    db.prepare(
      'UPDATE scan_history SET user_id = ? WHERE device_uuid = ? AND user_id IS NULL'
    ).run(user.id, deviceId);
  }

  const tokens = await issueTokens(user.id, deviceId);
  console.log(`[auth] verify ok | userId=${user.id}`);
  return c.json({ user: { id: user.id, email: user.email }, ...tokens });
});

// POST /apple
app.post('/apple', async (c) => {
  const { identityToken, fullName } = await c.req.json<{
    identityToken: string;
    fullName?: string;
  }>();
  const deviceId = c.get('deviceId');

  if (!identityToken) {
    return c.json({ error: 'Missing identityToken' }, 400);
  }

  try {
    const apple = await verifyAppleToken(identityToken);

    let user = users.findByAppleId(apple.sub);
    if (!user) {
      // Check if email exists and link
      if (apple.email) {
        user = users.findByEmail(apple.email);
        if (user) {
          users.update(user.id, { apple_id: apple.sub });
        }
      }
      if (!user) {
        user = users.create({
          apple_id: apple.sub,
          email: apple.email,
          display_name: fullName,
        });
      }
    }

    if (deviceId) {
      devices.linkToUser(deviceId, user.id);
      db.prepare(
        'UPDATE scan_history SET user_id = ? WHERE device_uuid = ? AND user_id IS NULL'
      ).run(user.id, deviceId);
    }

    const tokens = await issueTokens(user.id, deviceId);
    console.log(`[auth] apple ok | userId=${user.id}`);
    return c.json({ user: { id: user.id, email: user.email }, ...tokens });
  } catch (err: any) {
    console.error(`[auth] apple error | ${err.message}`);
    return c.json({ error: 'Apple authentication failed' }, 401);
  }
});

// POST /refresh
app.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json<{ refreshToken: string }>();

  if (!refreshToken) {
    return c.json({ error: 'Missing refreshToken' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const session = db.prepare(
    'SELECT * FROM sessions WHERE token = ? AND expires_at > ?'
  ).get(refreshToken, now) as any;

  if (!session) {
    return c.json({ error: 'Invalid or expired refresh token' }, 401);
  }

  // Delete old session (rotate)
  db.prepare('DELETE FROM sessions WHERE token = ?').run(refreshToken);

  const tokens = await issueTokens(session.user_id, session.device_uuid);
  console.log(`[auth] refresh ok | userId=${session.user_id}`);
  return c.json(tokens);
});

// POST /logout
app.post('/logout', requireAuth, async (c) => {
  const userId = c.get('userId')!;

  // Delete all sessions for user
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);

  console.log(`[auth] logout | userId=${userId}`);
  return c.json({ ok: true });
});

export default app;
