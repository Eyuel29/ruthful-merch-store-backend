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
export const charge = pgEnum('charge', ['percentage', 'fixed', 'flat']);
export const currency = pgEnum('currency', ['ETB', 'USD']);
export const paymentStatus = pgEnum('payment_status', ['pending', 'success', 'failed']);
export const orderStatus = pgEnum('order_status', ['pending', 'delivered', 'cancelled']);

export const user = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  roles: role().array().notNull().default(['customer']),
  emailVerified: boolean('email_verified').default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const session = pgTable('session', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const account = pgTable(
  'account',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    scope: text('scope'),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    password: text('password'),
    idToken: text('id_token'),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (schema) => [uniqueIndex('account_id_unq').on(schema.providerId, schema.accountId)],
);

export const verification = pgTable('verification', {
  id: uuid('id').defaultRandom().primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const productCategory = pgTable('category', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  logo: text('logo'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const productCategoryAttribute = pgTable('product_category_attribute', {
  id: uuid('id').defaultRandom().primaryKey(),
  productCategoryId: uuid('product_category_id')
    .references(() => productCategory.id, { onUpdate: 'cascade', onDelete: 'cascade' })
    .notNull(),
  attributeName: text('attribute_name').notNull(),
});

export const product = pgTable('product', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  isAvailable: boolean('is_available').notNull().default(true),
  categoryId: uuid('category_id')
    .references(() => productCategory.id, { onUpdate: 'cascade', onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const productImage = pgTable('product_image', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull(),
  alt: text('alt').default('Product Image'),
  thumbnailUrl: text('thumbnail_url').notNull(),
  displayOrder: integer().notNull(),
  productId: uuid('product_id')
    .references(() => product.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const productModel = pgTable('product_model', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .references(() => product.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  displayOrder: text('display_order').default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const productAttributeValue = pgTable('product_attribute_value', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .references(() => product.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  attributeId: uuid('attribute_id')
    .references(() => productCategoryAttribute.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  value: text('value').notNull(),
});

export const discount = pgTable('discount', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }).notNull(),
  maxRedemptions: integer('max_redemptions').notNull(),
  redemptionsCount: integer('redemptions_count').default(0).notNull(),
  productId: uuid('product_id').references(() => product.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade',
  }),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const cart = pgTable('cart', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const cartItem = pgTable('cart_item', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id')
    .references(() => cart.id, { onDelete: 'cascade' })
    .notNull(),
  productId: uuid('product_id')
    .references(() => product.id, { onDelete: 'cascade' })
    .notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(), // snapshot current price
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const order = pgTable('order', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => user.id)
    .notNull(),
  status: orderStatus('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderItem = pgTable('order_item', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => order.id, { onDelete: 'cascade' })
    .notNull(),
  productId: uuid('product_id')
    .references(() => product.id)
    .notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
});

export const payment = pgTable('payment', {
  id: uuid('id').defaultRandom().primaryKey(),
  mode: text('mode'),
  method: text('method'),
  type: text('type'),
  meta: text('meta'),
  charge: numeric('charge'),
  reference: text('reference'),
  currency: currency().notNull(),
  txRef: text('tx_ref').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: paymentStatus('status').notNull().default('pending'),
  customizationTitle: text('customization_title').notNull(),
  customizationDescription: text('customization_description').notNull(),
  customizationLogo: text('customization_logo'),
  userId: uuid('user_id')
    .references(() => user.id)
    .notNull(),
  orderId: uuid('order_id')
    .references(() => order.id)
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const review = pgTable('review', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  productId: uuid('product_id')
    .references(() => product.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
