import { createMiddleware } from 'hono/factory';
import * as jose from 'jose';
import { env } from '../env';

export type AuthVariables = {
  userId?: string;
  deviceId?: string;
  isApiClient?: boolean;
};

const secret = new TextEncoder().encode(env.JWT_SECRET);

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const auth = c.req.header('Authorization');
  const deviceId = c.req.header('X-Device-Id');

  if (deviceId) {
    c.set('deviceId', deviceId);
  }

  if (auth?.startsWith('Bearer ')) {
    const token = auth.slice(7);

    if (env.CRATE_API_KEY && token === env.CRATE_API_KEY) {
      c.set('isApiClient', true);
    } else {
      try {
        const { payload } = await jose.jwtVerify(token, secret, {
          algorithms: ['HS256'],
        });
        if (payload.sub) {
          c.set('userId', payload.sub);
        }
      } catch {
        // Invalid JWT — continue without userId
      }
    }
  }

  await next();
});

export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const userId = c.get('userId');
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

export const requireAuthOrDevice = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const userId = c.get('userId');
  const deviceId = c.get('deviceId');
  if (!userId && !deviceId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});
