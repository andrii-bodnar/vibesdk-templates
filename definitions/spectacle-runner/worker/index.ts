import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { userRoutes } from './userRoutes';
import { Env } from './core-utils';

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());

app.use('/api/*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type', 'Authorization'] }));

userRoutes(app);
app.get('/api/health', (c) => c.json({ success: true, data: { status: 'healthy', timestamp: new Date().toISOString() }}));

app.notFound((c) => c.json({ success: false, error: 'Not Found' }, 404));
app.onError((err, c) => { console.error(`[ERROR] ${err}`); return c.json({ success: false, error: 'Internal Server Error' }, 500); });

console.log(`Server is running`)

export default { fetch: app.fetch } satisfies ExportedHandler<Env>;
