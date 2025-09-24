import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent, jsonContentRequired } from 'stoker/openapi/helpers';
import { createErrorSchema } from 'stoker/openapi/schemas';

import {
  errorSchema,
  idParamsSchema,
  paginationSchema,
} from '@/db/validations/app.validation';
import {
  insertProductCategorySchema,
  paginatedProductCategorySchema,
  patchProductCategorySchema,
  selectProductCategorySchema,
} from '@/db/validations/product-category.validation';
import { commonResponses } from '@/lib/constants';
import verifyAuth from '@/middlewares/verify-auth';

const tags = ['Product Categories'];

export const create = createRoute({
  path: '/',
  method: 'post',
  request: {
    body: jsonContentRequired(
      insertProductCategorySchema,
      'The product category to create',
    ),
  },
  middleware: [verifyAuth(['admin', 'manager'])],
  tags,
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(selectProductCategorySchema, 'The created product category object.'),
    ...commonResponses,
  },
});

export const list = createRoute({
  path: '/',
  method: 'get',
  request: { query: paginationSchema },
  middleware: [verifyAuth(['admin', 'manager'])],
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      paginatedProductCategorySchema,
      'Successfully retrieved. Returns a paginated list of product category objects.',
    ),
    ...commonResponses,
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      errorSchema,
      'No catagories found for the given query parameters.',
    ),
  },
});

export const get = createRoute({
  path: '/{id}',
  method: 'get',
  request: { params: idParamsSchema },
  middleware: [verifyAuth(['admin', 'manager'])],
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(selectProductCategorySchema, 'The product category object.'),
    ...commonResponses,
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(idParamsSchema),
      'The provided ID is invalid or improperly formatted.',
    ),
  },
});

export const patch = createRoute({
  path: '/{id}',
  method: 'patch',
  request: {
    params: idParamsSchema,
    body: jsonContentRequired(patchProductCategorySchema, 'The fields to update for the specified product category.'),
  },
  tags,
  middleware: [verifyAuth(['admin', 'manager'])],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      selectProductCategorySchema,
      'Successfully updated. Returns the full updated product category object.',
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
    [HttpStatusCodes.OK]: jsonContent(selectProductCategorySchema, 'The product category object.'),
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'The product category was successfully deleted. No response body is returned.',
    },
    ...commonResponses,
    [HttpStatusCodes.CONFLICT]: jsonContent(
      errorSchema,
      'The category cannot be deleted due to existing dependencies (e.g., foreign key constraints).',
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(idParamsSchema),
      'The provided ID is invalid or improperly formatted.',
    ),
  },
});

export type CreateProductCategorysRoute = typeof create;
export type ListProductCategorysRoute = typeof list;
export type GetProductCategoryRoute = typeof get;
export type PatchProductCategoryRoute = typeof patch;
export type RemoveProductCategoryRoute = typeof remove;
