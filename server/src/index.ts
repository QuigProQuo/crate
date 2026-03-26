import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from './env';
import { authMiddleware, type AuthVariables } from './middleware/auth';
import { migrate } from './db/migrate';

import identifyRoutes from './routes/identify';
import gradeRoutes from './routes/grade';
import discogsRoutes from './routes/discogs';
import previewsRoutes from './routes/previews';
import authRoutes from './routes/auth';
import deviceRoutes from './routes/devices';
import syncRoutes from './routes/sync';
import alertRoutes from './routes/alerts';

import { startPriceAlertCron } from './cron/price-alerts';

const app = new Hono<{ Variables: AuthVariables }>();

// Global middleware
app.use('*', cors());
app.use('*', logger());
app.use('/v1/*', authMiddleware);

// Mount routes
app.route('/v1/identify', identifyRoutes);
app.route('/v1/grade', gradeRoutes);
app.route('/v1/discogs', discogsRoutes);
app.route('/v1/previews', previewsRoutes);
app.route('/v1/auth', authRoutes);
app.route('/v1/devices', deviceRoutes);
app.route('/v1/sync', syncRoutes);
app.route('/v1/alerts', alertRoutes);

// Health check
app.get('/health', (c) => c.json({ ok: true }));

// Run migrations and start
migrate();
startPriceAlertCron();

export default {
  port: env.PORT,
  fetch: app.fetch,
};

console.log(`[server] Crate API running on port ${env.PORT}`);
