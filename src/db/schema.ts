import {
  boolean,
  decimal,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const role = pgEnum('role', ['customer', 'admin', 'manager']);
export const paymentStatus = pgEnum('payment_status', ['pending', 'completed', 'failed']);
export const discountType = pgEnum('discount_type', ['percentage', 'fixed']);

export const user = pgTable('user', {
  id: uuid('user_id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  roles: role().array().notNull().default(['customer']),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: uuid('session_id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const account = pgTable('account', {
  id: uuid('account_id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  scope: text('scope'),
  accountId: text('account_id_ref').notNull(),
  providerId: text('provider_id').notNull(),
  password: text('password'),
  idToken: text('id_token'),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, schema => [uniqueIndex('account_id_unq').on(schema.providerId, schema.accountId)]);

export const verification = pgTable('verification', {
  id: uuid('verification_id').defaultRandom().primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productCategory = pgTable('category', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  logo: text('logo').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productAttribute = pgTable('product_attribute', {
  id: uuid('id').defaultRandom().primaryKey(),
  productCategoryId: uuid('product_category_id').references(() => productCategory.id).notNull(),
  attributeName: text().notNull(),
});

export const product = pgTable('product', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  isAvailable: boolean('is_available').notNull().default(true),
  categoryId: uuid('category_id').references(() => productCategory.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productImage = pgTable('product_image', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull(),
  alt: text('alt').notNull(),
  previewUrl: text('preview_url').notNull(),
  productId: uuid('product_id').references(() => product.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productAttributeValue = pgTable('product_attribute_value', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => product.id).notNull(),
  productAttributeId: uuid('product_attribute_id').references(() => productAttribute.id),
  value: text().notNull(),
});

export const review = pgTable('review', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => user.id).notNull(),
  productId: uuid('product_id').references(() => product.id).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const discount = pgTable('discount', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  type: discountType('type').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  maxDiscount: numeric('max_discount', { precision: 10, scale: 2 }).notNull(),
  minOrderValue: numeric('min_order_value', { precision: 10, scale: 2 }).notNull(),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').notNull().default(0),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  productId: uuid('product_id').references(() => product.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
