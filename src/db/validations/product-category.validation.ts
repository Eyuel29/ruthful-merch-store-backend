import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { productCategory, productCategoryAttribute } from '../schema';

export const selectProductCategorySchema = createSelectSchema(productCategory).extend({
  attributes: z.array(createSelectSchema(productCategoryAttribute)).optional(),
});

export const paginatedProductCategorySchema = z.object({
  currentPage: z.number().int().positive(),
  totalPages: z.number().int().positive(),
  productCategories: z.array(selectProductCategorySchema),
});

const baseInsertCategorySchema = createInsertSchema(productCategory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const insertAttributeSchema = createInsertSchema(productCategoryAttribute).omit({
  id: true,
  productCategoryId: true,
});

export const insertProductCategorySchema = baseInsertCategorySchema.extend({
  name: z
    .string()
    .min(3, { message: 'Category name must be at least 3 characters long.' })
    .max(50, { message: 'Category name must not exceed 50 characters.' }),
  description: z
    .string()
    .max(255, { message: 'Description must not exceed 255 characters.' })
    .optional(),
  logo: z.url({ message: 'Logo must be a valid URL.' }).optional(),
  attributes: z
    .array(
      insertAttributeSchema.extend({
        attributeName: z
          .string()
          .min(2, { message: 'Attribute name must be at least 2 characters long.' })
          .max(50, { message: 'Attribute name must not exceed 50 characters.' }),
      }),
    )
    .min(1, { message: 'At least one attribute is required.' }),
});

export const patchProductCategorySchema = insertProductCategorySchema.extend({
  attributes: z.array(
    z.object({
      attributeName: z.string().optional(),
      id: z.string().optional(),
      productCategoryId: z.string().optional(),
    }),
  ),
});
