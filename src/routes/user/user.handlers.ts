import type { RouteHandler } from '@hono/zod-openapi';

import { count, eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import { db } from '@/db/index';
import { user } from '@/db/schema';

import type { GetUserRoute, ListUserRoute, PatchUserRoute, RemoveUserRoute } from './user.routes';

export const list: RouteHandler<ListUserRoute> = async (c) => {
  const { page } = c.req.valid('query');
  const limit = 10;
  const offset = (page - 1) * limit;

  const [result] = await db.select({ totalCount: count(user.id) }).from(user);
  const totalCount = result?.totalCount ?? 0;

  if (totalCount === 0) {
    return c.json(
      {
        totalUsers: 0,
        currentPage: page,
        totalPages: 0,
        users: [],
      },
      HttpStatusCodes.OK,
    );
  }

  const users = await db.query.user.findMany({
    limit,
    offset,
  });

  return c.json(
    {
      totalUsers: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      users,
    },
    HttpStatusCodes.OK,
  );
};

export const patch: RouteHandler<PatchUserRoute> = async (c) => {
  const { id } = c.req.valid('param');
  const updates = c.req.valid('json');

  if (Object.keys(updates).length === 0) {
    return c.json({ message: 'No updates were provided.' }, HttpStatusCodes.BAD_REQUEST);
  }

  const [updatedUser] = await db.update(user).set(updates).where(eq(user.id, id)).returning();

  if (!updatedUser) {
    return c.json({ message: 'User not found.' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(updatedUser, HttpStatusCodes.OK);
};

export const get: RouteHandler<GetUserRoute> = async (c) => {
  const { id } = c.req.valid('param');

  const foundUser = await db.query.user.findFirst({
    where: eq(user.id, id ?? ''),
  });

  if (!foundUser?.id) {
    return c.json({ message: 'User not found.' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(foundUser, HttpStatusCodes.OK);
};

export const remove: RouteHandler<RemoveUserRoute> = async (c) => {
  try {
    const { id } = c.req.valid('param');

    const result = await db.delete(user).where(eq(user.id, String(id)));

    if (result.rowCount === 0) {
      return c.json({ message: 'User not found.' }, HttpStatusCodes.NOT_FOUND);
    }

    return c.body(null, HttpStatusCodes.NO_CONTENT);
  } catch {
    return c.json(
      { message: 'Could not delete user. Please try again later.' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
