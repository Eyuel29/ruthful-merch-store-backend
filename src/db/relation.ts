import { relations } from 'drizzle-orm';

import {
  account,
  discount,
  order,
  orderItem,
  payment,
  productVariant,
  productAttributeValue,
  productCategory,
  productCategoryAttribute,
  productImage,
  productModel,
  review,
  session,
  user,
} from './schema';

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const productCategoryRelations = relations(productCategory, ({ many }) => ({
  products: many(productVariant),
  attributes: many(productCategoryAttribute),
}));

export const productCategoryAttributeRelations = relations(productCategoryAttribute, ({ one, many }) => ({
  productCategory: one(productCategory, {
    fields: [productCategoryAttribute.productCategoryId],
    references: [productCategory.id],
  }),
  attributeValues: many(productAttributeValue),
}));

export const productRelations = relations(productVariant, ({ many, one }) => ({
  category: one(productCategory, {
    fields: [productVariant.categoryId],
    references: [productCategory.id],
  }),
  images: many(productImage),
  models: many(productModel),
  attributeValues: many(productAttributeValue),
  discounts: many(discount),
  orderItems: many(orderItem),
  reviews: many(review),
}));

export const productAttributeValueRelations = relations(productAttributeValue, ({ one }) => ({
  product: one(productVariant, {
    fields: [productAttributeValue.productId],
    references: [productVariant.id],
  }),
  attribute: one(productCategoryAttribute, {
    fields: [productAttributeValue.attributeId],
    references: [productCategoryAttribute.id],
  }),
}));

export const productImageRelations = relations(productImage, ({ one }) => ({
  product: one(productVariant, {
    fields: [productImage.productId],
    references: [productVariant.id],
  }),
}));

export const productModelRelations = relations(productModel, ({ one }) => ({
  product: one(productVariant, {
    fields: [productModel.productId],
    references: [productVariant.id],
  }),
}));

export const discountRelations = relations(discount, ({ one }) => ({
  product: one(productVariant, {
    fields: [discount.productId],
    references: [productVariant.id],
  }),
}));

export const orderRelations = relations(order, ({ many, one }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  items: many(orderItem),
  payments: many(payment),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  product: one(productVariant, {
    fields: [orderItem.productId],
    references: [productVariant.id],
  }),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
  user: one(user, {
    fields: [payment.userId],
    references: [user.id],
  }),
  order: one(order, {
    fields: [payment.orderId],
    references: [order.id],
  }),
}));

export const reviewRelations = relations(review, ({ one }) => ({
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
  product: one(productVariant, {
    fields: [review.productId],
    references: [productVariant.id],
  }),
}));
