import { boolean, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const role = pgEnum('role', ['customer', 'admin', 'manager']);

export const user = pgTable('user', {
  id: text('user_id').primaryKey().$default(nanoid),
  email: text('email').notNull().unique(),
  name: text('name'),
  roles: role().array().default(['customer']),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: text('session_id').primaryKey().$default(nanoid),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const account = pgTable(
  'account',
  {
    id: text('account_id').primaryKey().$default(nanoid),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    scope: text('scope'),
    accountId: text('account_id_ref').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    providerId: text('provider_id').notNull(),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => [uniqueIndex('account_id_unq').on(table.providerId, table.accountId)],
);

export const verification = pgTable('verification', {
  id: text('verification_id').primaryKey().$default(nanoid),
  identifier: text('identifier').notNull(),
  value: text('value').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
