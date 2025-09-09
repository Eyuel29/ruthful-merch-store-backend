import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import {
  errorSchema,
  idParamsSchema,
  paginatedUserSchema,
  paginationSchema,
  patchUserSchema,
  selectUserSchema,
} from '@/db/validation';
import { commonResponses } from '@/lib/constants';

const tags = ['Users'];

export const patch = createRoute({
  path: '/{id}',
  method: 'patch',
  request: {
    params: idParamsSchema,
    body: jsonContentRequired(patchUserSchema, 'The fields to update for the specified user.'),
  },
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectUserSchema,
      'Successfully updated. Returns the full updated user object.',
    ),
    ...commonResponses,
    [HttpStatusCodes.CONFLICT]: jsonContent(
      errorSchema,
      'The update could not be applied due to a conflict (e.g., unique constraint violation).',
    ),
  },
});

export const remove = createRoute({
  path: '/{id}',
  method: 'delete',
  request: { params: idParamsSchema },
  tags,
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'The user was successfully deleted. No response body is returned.',
    },
    ...commonResponses,
    [HttpStatusCodes.CONFLICT]: jsonContent(
      errorSchema,
      'The user cannot be deleted due to existing dependencies (e.g., foreign key constraints).',
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(idParamsSchema),
      'The provided user ID is invalid or improperly formatted.',
    ),
  },
});

export const list = createRoute({
  path: '/',
  method: 'get',
  tags,
  request: { query: paginationSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      paginatedUserSchema,
      'Successfully retrieved. Returns a paginated list of user objects.',
    ),
    ...commonResponses,
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      errorSchema,
      'No users found for the given query parameters.',
    ),
  },
});

export const get = createRoute({
  path: '/{id}',
  method: 'get',
  tags,
  request: { params: idParamsSchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectUserSchema, 'The user object.'),
    ...commonResponses,
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(idParamsSchema),
      'The provided user ID is invalid or improperly formatted.',
    ),
  },
});

export type ListUserRoute = typeof list;
export type GetUserRoute = typeof get;
export type PatchUserRoute = typeof patch;
export type RemoveUserRoute = typeof remove;
