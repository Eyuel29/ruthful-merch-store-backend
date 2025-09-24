import { OpenAPIHono } from '@hono/zod-openapi';
import { defaultHook } from 'stoker/openapi';

import * as handlers from './product.handler';
import * as routes from './product.route';

export const router = new OpenAPIHono({
  strict: false,
  defaultHook,
});

router
  .openapi(routes.get, handlers.get)
  .openapi(routes.list, handlers.list)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);

export default router;
