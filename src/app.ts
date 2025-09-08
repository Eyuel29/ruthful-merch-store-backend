/* eslint-disable no-console */
import env from '@/env';
import { connect } from '@/db/index';
import { OpenAPIHono } from '@hono/zod-openapi';
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares';
import { defaultHook } from 'stoker/openapi';
import { verifyOrigin } from '@/middlewares/verify-origin';
import { logger } from 'hono/logger';
import userRouter from './routes/user/user.index';

import { Scalar } from '@scalar/hono-api-reference';
import packageJSON from '../package.json' with { type: 'json' };

const scalarProxyUrl = env.ENVIRONMENT === 'development' ? 'https://proxy.scalar.com' : undefined;

const app = new OpenAPIHono({
  strict: false,
  defaultHook,
});

app.use(verifyOrigin);
app.use(serveEmojiFavicon('❤️'));
app.use(logger());
app.notFound(notFound);
app.onError(onError);

app.route('/api/users', userRouter);

app.doc('/api/doc', {
  openapi: '',
  info: {
    version: packageJSON.version,
    title: 'Ruthful Hearts API',
  },
});

app.get(
  '/api/reference',
  Scalar({
    theme: 'alternate',
    layout: 'modern',
    defaultHttpClient: {
      targetKey: 'js',
      clientKey: 'fetch',
    },
    url: '/api/doc',
    proxyUrl: scalarProxyUrl,
  }),
);

(async () => {
  if (env.ENVIRONMENT !== 'test') {
    try {
      await connect();
      const server = Bun.serve({
        fetch: app.fetch,
        hostname: '0.0.0.0',
        port: env.PORT,
      });
      console.log(`Server running on ${server.url}`);
    } catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  }
})();
