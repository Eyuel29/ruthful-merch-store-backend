import z from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

export const idParamsSchema = z.object({
  id: z.string(),
});

export const errorSchema = z.object({
  message: z.string(),
});
