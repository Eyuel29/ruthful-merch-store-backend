import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import {
  account,
  productCategory,
  productCategoryAttribute,
  session,
  user,
  verification,
} from './schema';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

export const idParamsSchema = z.object({
  id: z.string(),
});

export const selectUserSchema = createSelectSchema(user);

export const paginatedUserSchema = z.object({
  currentPage: z.number().int().positive(),
  totalPages: z.number().int().positive(),
  users: z.array(selectUserSchema),
});

export const insertUserSchema = createInsertSchema(user).omit({
  id: true,
  roles: true,
  createdAt: true,
  updatedAt: true,
  emailVerified: true,
});

export const patchUserSchema = insertUserSchema.partial();

export const selectSessionSchema = createSelectSchema(session);

export const insertSessionSchema = createInsertSchema(session).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const patchSessionSchema = insertSessionSchema.partial();

export const selectAccountSchema = createSelectSchema(account);

export const insertAccountSchema = createInsertSchema(account).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const patchAccountSchema = insertAccountSchema.partial();

export const selectVerificationSchema = createSelectSchema(verification);

export const insertVerificationSchema = createInsertSchema(verification).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const patchVerificationSchema = insertVerificationSchema.partial();

export const signUpSchema = z.object({
  name: z
    .string()
    .regex(/^[A-Z\s]*$/i, {
      message: 'Name should only contain letters and spaces.',
    })
    .min(3, { message: 'Name must be at least 3 characters long.' })
    .max(50, { message: 'Name must not exceed 50 characters.' }),
  email: z.string().email({ message: 'Please provide a valid email address.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter.',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter.',
    })
    .regex(/\d/, { message: 'Password must contain at least one number.' })
    .regex(/[^A-Z0-9]/i, {
      message: 'Password must contain at least one special character.',
    }),
  image: z.string().url({ message: 'Please provide a valid URL for the image.' }).optional(),
});

export const signInSchema = z.object({
  email: z.email({ message: 'Please provide a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
});

export const errorSchema = z.object({
  message: z.string(),
});

export const photoUploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, { message: 'At least one file is required.' })
    .max(10, { message: 'You can upload a maximum of 10 files.' })
    .refine(
      (files) =>
        files.every((file) => {
          const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
          return validTypes.includes(file.type);
        }),
      'Only .jpg, .png and .webp files are allowed.',
    )
    .refine(
      (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
      'Each file must be less than 5MB.',
    ),
});

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
