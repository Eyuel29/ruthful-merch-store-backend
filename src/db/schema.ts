import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const role = pgEnum('role', ['customer', 'admin', 'manager']);
export const productStatus = pgEnum('product_status', [
  'available',
  'low_stock',
  'unavailable',
  'featured',
]);

export const currency = pgEnum('currency', ['ETB', 'USD']);
export const paymentStatus = pgEnum('payment_status', ['pending', 'success', 'failed']);
export const orderStatus = pgEnum('order_status', [
  'pending',
  'confirmed',
  'processing',
  'delivered',
  'cancelled',
  'returned',
]);
export const analyticsEvent = pgEnum('analytics_event', [

  'cart_created',
  'product_added_to_cart',
  'product_removed_from_cart',
  'cart_updated',

  'checkout_started',
  'checkout_completed',
  'order_created',
  'order_paid',
  'order_cancelled',
  'order_returned',

  'user_signed_up',
  'user_logged_in',
  'user_logged_out',

  'product_viewed',
  'review_submitted',
  'review_helpful_clicked',
]);

export const user = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  phone: text('phone'),
  roles: role().array().notNull().default(['customer']),
  emailVerified: boolean('email_verified').default(false),
  phoneVerified: boolean('phone_verified').default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, schema => [
  {
    emailIdx: index('user_email_idx').on(schema.email),
    phoneIdx: index('user_phone_idx').on(schema.phone),
  },
]);

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
}, schema => [
  {
    tokenIdx: index('session_token_idx').on(schema.token),
    userIdx: index('session_user_idx').on(schema.userId),
  },
]);

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
  schema => [
    {
      accountIdUnq: uniqueIndex('account_id_unq').on(schema.providerId, schema.accountId),
      userIdx: index('account_user_idx').on(schema.userId),
    },
  ],
);

export const verification = pgTable('verification', {
  id: uuid('id').defaultRandom().primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, schema => [
  {
    identifierIdx: index('verification_identifier_idx').on(schema.identifier),
  },
]);

export const productCategory = pgTable('category', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  logo: text('logo'),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),

}, schema => [
  {
    slugIdx: index('category_slug_idx').on(schema.slug),
    parentIdx: index('category_parent_idx').on(schema.parentId),
  },
]);

export const productCategoryAttribute = pgTable('product_category_attribute', {
  id: uuid('id').defaultRandom().primaryKey(),
  productCategoryId: uuid('product_category_id')
    .references(() => productCategory.id, { onUpdate: 'cascade', onDelete: 'cascade' })
    .notNull(),
  attributeName: text('attribute_name').notNull(),
  attributeType: text('attribute_type').notNull().default('text'),
  isRequired: boolean('is_required').default(false),
  options: text('options').array(),
  displayOrder: integer('display_order').notNull(),
});

export const product = pgTable(
  'product',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    shortDescription: text('short_description'),
    sku: text('sku').unique(),
    basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
    trackQuantity: boolean('track_quantity').default(true),
    allowBackorders: boolean('allow_backorders').default(false),
    status: productStatus('status').notNull().default('available'),
    tags: text('tags').array(),
    categoryId: uuid('category_id')
      .references(() => productCategory.id, {
        onUpdate: 'cascade',
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  schema => [
    index('product_slug_idx').on(schema.slug),
    index('product_sku_idx').on(schema.sku),
    index('product_category_idx').on(schema.categoryId),
    index('product_status_idx').on(schema.status),
  ],
);

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
  displayOrder: integer().notNull(),
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

export const cart = pgTable('cart', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => user.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, schema => [
  {
    userIdx: index('cart_user_idx').on(schema.userId),
  },
]);

export const cartItem = pgTable('cart_item', {
  id: uuid('id').defaultRandom().primaryKey(),
  cartId: uuid('cart_id')
    .references(() => cart.id, { onDelete: 'cascade' })
    .notNull(),
  productId: uuid('product_id')
    .references(() => product.id, { onDelete: 'cascade' })
    .notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, schema => [
  {
    cartIdx: index('cart_item_cart_idx').on(schema.cartId),
    productIdx: index('cart_item_product_idx').on(schema.productId),
  },
]);

export const order = pgTable('order', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: uuid('user_id')
    .references(() => user.id)
    .notNull(),
  status: orderStatus().notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, schema => [
  {
    orderNumberIdx: index('order_number_idx').on(schema.orderNumber),
    userIdx: index('order_user_idx').on(schema.userId),
    statusIdx: index('order_status_idx').on(schema.status),
    dateIdx: index('order_date_idx').on(schema.createdAt),
  },
]);

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
}, schema => [
  {
    orderIdx: index('order_item_order_idx').on(schema.orderId),
    productIdx: index('order_item_product_idx').on(schema.productId),
  },
]);

export const discount = pgTable('discount', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }).notNull(),
  maxRedemptions: integer('max_redemptions'),
  maxRedemptionsPerCustomer: integer('max_redemptions_per_customer').default(1),
  isActive: boolean('is_active').default(true),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, schema => [
  {
    codeIdx: index('discount_code_idx').on(schema.code),
    activeIdx: index('discount_active_idx').on(schema.isActive),
    datesIdx: index('discount_dates_idx').on(schema.startsAt, schema.endsAt),
  },
]);

export const discountProduct = pgTable('discount_product', {
  id: uuid('id').defaultRandom().primaryKey(),
  discountId: uuid('discount_id')
    .references(() => discount.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  productId: uuid('product_id')
    .references(() => product.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
});

export const discountUsage = pgTable('discount_usage', {
  id: uuid('id').defaultRandom().primaryKey(),
  discountId: uuid('discount_id')
    .references(() => discount.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  orderId: uuid('order_id')
    .references(() => order.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
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
}, schema => [
  {
    orderIdx: index('payment_order_idx').on(schema.orderId),
    userIdx: index('payment_user_idx').on(schema.userId),
    statusIdx: index('payment_status_idx').on(schema.status),
  },
]);

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
  helpfulCount: integer('helpful_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const wishlist = pgTable(
  'wishlist',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' })
      .notNull(),
    productId: uuid('product_id')
      .references(() => product.id, { onDelete: 'cascade', onUpdate: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  schema => [
    {
      userProductIdx: uniqueIndex('wishlist_user_product_idx').on(schema.userId, schema.productId),
      userIdx: index('wishlist_user_idx').on(schema.userId),
    },
  ],
);

export const analytics = pgTable(
  'analytics',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    event: analyticsEvent('event').notNull(),
    userId: uuid('user_id').references(() => user.id),
    productId: uuid('product_id').references(() => product.id),
    orderId: uuid('order_id').references(() => order.id),
    data: jsonb('data'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  schema => [
    index('analytics_event_idx').on(schema.event),
    index('analytics_user_idx').on(schema.userId),
    index('analytics_product_idx').on(schema.productId),
    index('analytics_order_idx').on(schema.orderId),
    index('analytics_date_idx').on(schema.createdAt),
  ],
);
