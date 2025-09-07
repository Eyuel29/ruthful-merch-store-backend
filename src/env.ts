/* eslint-disable no-console */
import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { resolve } from "path";
import { z } from "zod";

const envPath =
  process.env.NODE_ENV === "development"
    ? ".env.local"
    : process.env.NODE_ENV === "test"
      ? ".env.test"
      : ".env";

expand(
  config({
    path: resolve(process.cwd(), envPath),
    quiet: true,
  }),
);

const envSchema = z
  .object({
    APP_NAME: z.string(),
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number().default(3000),
    DATABASE_AUTH_TOKEN: z.string().optional(),
    DATABASE_URL: z.url(),
  })
  .superRefine((input, ctx) => {
    if (input.NODE_ENV === "production" && !input.DATABASE_AUTH_TOKEN) {
      ctx.addIssue({
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["DATABASE_AUTH_TOKEN"],
        message: "Must be set when NODE_ENV is 'production'",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

const { data: env, error } = envSchema.safeParse(process.env);

if (error) {
  console.error("Invalid env:");
  console.error(JSON.stringify(z.treeifyError(error), null, 2));
  process.exit(1);
}

export default env!;
