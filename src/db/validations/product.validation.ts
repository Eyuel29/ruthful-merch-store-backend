import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { product, productAttributeValue, productImage, productModel } from '../schema';
import { paginationSchema } from './app.validation';

export const selectProductSchema = createSelectSchema(product).extend({
  images: z.array(createSelectSchema(productImage)).optional(),
  models: z.array(createSelectSchema(productModel)).optional(),
  attributes: z.array(createSelectSchema(productAttributeValue)).optional(),
});

export const paginatedProductSchema = z.object({
  currentPage: z.number().int().positive(),
  totalPages: z.number().int().positive(),
  products: z.array(selectProductSchema),
});

const baseInsertProductSchema = createInsertSchema(product).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const insertProductImageSchema = createInsertSchema(productImage).omit({
  id: true,
  productId: true,
  createdAt: true,
  updatedAt: true,
});

const insertProductModelSchema = createInsertSchema(productModel).omit({
  id: true,
  productId: true,
  createdAt: true,
  updatedAt: true,
});

const insertProductAttributeValueSchema = createInsertSchema(productAttributeValue).omit({
  id: true,
  productId: true,
});

export const insertProductSchema = baseInsertProductSchema.extend({
  name: z
    .string()
    .min(3, { message: 'Product name must be at least 3 characters long.' })
    .max(100, { message: 'Product name must not exceed 100 characters.' }),
  description: z
    .string()
    .max(500, { message: 'Description must not exceed 500 characters.' })
    .optional(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: 'Price must be a valid decimal number.' }),
  stock: z.number().int().nonnegative(),
  images: z
    .array(
      insertProductImageSchema.extend({
        url: z.url(),
        thumbnailUrl: z.url(),
      }),
    )
    .optional(),
  models: z
    .array(
      insertProductModelSchema.extend({
        url: z.url(),
      }),
    )
    .optional(),
  attributes: z
    .array(
      insertProductAttributeValueSchema.extend({
        value: z.string().min(1, { message: 'Attribute value cannot be empty.' }),
      }),
    )
    .optional(),
});

export const patchProductSchema = insertProductSchema.partial().extend({
  id: z.uuid().optional(),
  images: z
    .array(
      insertProductImageSchema.extend({
        id: z.uuid().optional(),
        url: z.url(),
        thumbnailUrl: z.url(),
      }),
    )
    .optional(),
  models: z
    .array(
      insertProductModelSchema.extend({
        id: z.uuid().optional(),
        url: z.url(),
      }),
    )
    .optional(),
  attributes: z
    .array(
      insertProductAttributeValueSchema.extend({
        id: z.uuid().optional(),
        value: z.string().min(1, { message: 'Attribute value cannot be empty.' }),
      }),
    )
    .optional(),
});

export const productFilterSchema = paginationSchema.extend({
  categoryId: z.uuid().optional(),
  minPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  maxPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  q: z.string().min(1).optional(),
});
