/* eslint-disable no-console */
import { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { logger } from 'hono/logger';
import { notFound, serveEmojiFavicon } from 'stoker/middlewares';
import { defaultHook } from 'stoker/openapi';

import { connect } from '@/db/index';
import env from '@/env';
import auth from '@/lib/auth';
import errorHandler from '@/middlewares/error-handler';
import { verifyOrigin } from '@/middlewares/verify-origin';
import categoryRouter from '@/routes/product-category/product-category.index';
import productRouter from '@/routes/product/product.index';
import userRouter from '@/routes/user/user.index';

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
app.use(errorHandler);

app.route('/api/users', userRouter);
app.route('/api/categories', categoryRouter);
app.route('/api/products', productRouter);

app.doc('/api/doc', {
  openapi: '3.1.0',
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

app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  return auth.handler(c.req.raw);
});

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
    }
    catch (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  }
})();
