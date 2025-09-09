import { createMiddleware } from 'hono/factory';

import type { user } from '@/db/schema';
import type { Auth } from '@/lib/auth';

import auth from '@/lib/auth';

export interface AuthEnv {
  Variables: Auth;
};

type Role = typeof user.$inferInsert.roles;

function verifyAuth(allowedRoles: Role = []) {
  return createMiddleware<AuthEnv>(async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session || !session.user) {
      return c.json({ message: 'Unauthorized' }, 401);
    }

    if (!session.user.emailVerified) {
      return c.json({ message: 'Forbidden' }, 403);
    }

    const roles = session.user.roles as Role;
    const accessGranted = roles!.some(role => allowedRoles!.includes(role));

    if (allowedRoles!.length > 0 && !accessGranted) {
      return c.json({ message: 'Forbidden' }, 403);
    }

    c.set('user', session.user);
    c.set('session', session.session);
    await next();
  });
}

export default verifyAuth;
