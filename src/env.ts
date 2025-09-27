/* eslint-disable node/no-process-env */
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { resolve } from 'node:path';
import { z } from 'zod';

const envPath = process.env.ENVIRONMENT === 'test' ? '.env.test' : '.env';

expand(
  config({
    path: resolve(process.cwd(), envPath),
    quiet: true,
  }),
);

const envSchema = z
  .object({
    APP_NAME: z.string(),
    ENVIRONMENT: z.string().default('development'),
    PORT: z.coerce.number().default(3000),
    ALLOWED_ORIGINS: z.string(),
    DATABASE_AUTH_TOKEN: z.string().optional(),
    DATABASE_URL: z.url(),
    RESEND_TOKEN: z.string(),
    EMAIL_ADDRESS: z.email(),
    SENDER_ADDRESS: z.email(),
    EMAIL_PASS: z.string(),
    GOOGLE_OAUTH_CLIENT_ID: z.string(),
    GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    TOKEN_LIFETIME: z.coerce.number(),
    SESSION_LIFETIME: z.coerce.number(),
  })
  .superRefine((input, ctx) => {
    if (input.ENVIRONMENT === 'production' && !input.DATABASE_AUTH_TOKEN) {
      ctx.addIssue({
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        path: ['DATABASE_AUTH_TOKEN'],
        message: 'Must be set when ENVIRONMENT is \'production\'',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

const { data: env, error } = envSchema.safeParse(process.env);

if (error) {
  console.error('Invalid env:');
  console.error(JSON.stringify(z.treeifyError(error), null, 2));
  process.exit(1);
}

export default env!;
