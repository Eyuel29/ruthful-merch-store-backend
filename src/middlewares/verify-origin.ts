import { cors } from 'hono/cors';

import env from '@/env';

const allowedOrigins = env.ALLOWED_ORIGINS.split(',');

export const verifyOrigin = cors({
  origin: origin => (allowedOrigins.includes(origin) ? origin : null),
  allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Source', 'Origin', 'Accept'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
});
