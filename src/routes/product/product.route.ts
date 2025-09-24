import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';

import { errorSchema, idParamsSchema } from '@/db/validations/app.validation';
import {
  insertProductSchema,
  paginatedProductSchema,
  patchProductSchema,
  productFilterSchema,
  selectProductSchema,
} from '@/db/validations/product.validation';
import { commonResponses } from '@/lib/constants';
import verifyAuth from '@/middlewares/verify-auth';

const tags = ['Products'];

export const create = createRoute({
  path: '/',
  method: 'post',
  request: {
    body: jsonContentRequired(insertProductSchema, 'The product to create'),
  },
  middleware: [verifyAuth(['admin', 'manager'])],
  tags,
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(selectProductSchema, 'The created product object.'),
    ...commonResponses,
  },
});

export const list = createRoute({
  path: '/',
  method: 'get',
  request: { query: productFilterSchema },
  middleware: [verifyAuth(['admin', 'manager'])],
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      paginatedProductSchema,
      'Successfully retrieved. Returns a paginated list of product objects.',
    ),
    ...commonResponses,
  },
});

export const get = createRoute({
  path: '/{id}',
  method: 'get',
  request: { params: idParamsSchema },
  middleware: [verifyAuth(['admin', 'manager'])],
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectProductSchema, 'The product object.'),
    ...commonResponses,
  },
});

export const patch = createRoute({
  path: '/{id}',
  method: 'patch',
  request: {
    params: idParamsSchema,
    body: jsonContentRequired(
      patchProductSchema,
      'The fields to update for the specified product.',
    ),
  },
  tags,
  middleware: [verifyAuth(['admin', 'manager'])],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectProductSchema,
      'Successfully updated. Returns the full updated product object.',
    ),
    ...commonResponses,
  },
});

export const remove = createRoute({
  path: '/{id}',
  method: 'delete',
  request: { params: idParamsSchema },
  tags,
  middleware: [verifyAuth(['admin', 'manager'])],
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'The product was successfully deleted. No response body is returned.',
    },
    ...commonResponses,
    [HttpStatusCodes.CONFLICT]: jsonContent(
      errorSchema,
      'The product cannot be deleted due to existing dependencies (e.g., foreign key constraints).',
    ),
  },
});

export type CreateProductRoute = typeof create;
export type ListProductsRoute = typeof list;
export type GetProductRoute = typeof get;
export type PatchProductRoute = typeof patch;
export type RemoveProductRoute = typeof remove;
