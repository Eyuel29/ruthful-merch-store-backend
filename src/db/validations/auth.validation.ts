import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { account, session, user, verification } from '../schema';

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
