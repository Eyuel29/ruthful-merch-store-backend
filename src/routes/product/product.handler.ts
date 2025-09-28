import type { RouteHandler } from '@hono/zod-openapi';
import type { InferSelectModel } from 'drizzle-orm';

import { count, eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import { db } from '@/db';
import { productVariant, productAttributeValue, productImage, productModel } from '@/db/schema';

import type {
  CreateProductRoute,
  GetProductRoute,
  ListProductsRoute,
  PatchProductRoute,
  RemoveProductRoute,
} from './product.route';

type ProductImage = InferSelectModel<typeof productImage>;
type NewProductImage = Omit<ProductImage, 'id'>;
type ProductModel = InferSelectModel<typeof productModel>;
type NewProductModel = Omit<ProductModel, 'id'>;
type ProductAttributeValue = InferSelectModel<typeof productAttributeValue>;
type NewProductAttributeValue = Omit<ProductAttributeValue, 'id'>;

export const create: RouteHandler<CreateProductRoute> = async (c) => {
  const productInput = c.req.valid('json');

  const result = await db.transaction(async (tx) => {
    const [newProduct] = await tx
      .insert(productVariant)
      .values({ ...productInput })
      .returning();

    if (productInput.images?.length) {
      await tx.insert(productImage).values(
        productInput.images.map(img => ({
          ...img,
          productId: newProduct!.id,
        })),
      );
    }

    if (productInput.models?.length) {
      await tx.insert(productModel).values(
        productInput.models.map(m => ({
          ...m,
          productId: newProduct!.id,
        })),
      );
    }

    if (productInput.attributes?.length) {
      await tx.insert(productAttributeValue).values(
        productInput.attributes.map(a => ({
          ...a,
          productId: newProduct!.id,
        })),
      );
    }

    return tx.query.product.findFirst({
      with: {
        productImage: true,
        productModel: true,
        productAttributeValue: true,
      },
      where: eq(productVariant.id, newProduct!.id),
    });
  });

  return c.json(result, HttpStatusCodes.CREATED);
};

export const list: RouteHandler<ListProductsRoute> = async (c) => {
  const { page, categoryId, minPrice, maxPrice, q } = c.req.valid('query');
  const limit = 20;
  const offset = (page - 1) * limit;

  const result = await db.transaction(async (tx) => {
    const [productCount] = await tx.select({ total: count(productVariant.id) }).from(productVariant);

    if (!productCount) {
      return {
        currentPage: page,
        totalPages: 0,
        products: [],
      };
    }

    const products = await tx.query.product.findMany({
      offset,
      limit,
      with: {
        productImage: true,
        productModel: true,
        productAttributeValue: true,
      },
      where: (p, { and, eq, gte, lte, like }) =>
        and(
          categoryId ? eq(p.categoryId, categoryId) : undefined,
          minPrice ? gte(p.price, minPrice) : undefined,
          maxPrice ? lte(p.price, maxPrice) : undefined,
          q ? like(p.name, `%${q}%`) : undefined,
        ),
    });

    return {
      currentPage: page,
      totalPages: Math.ceil(productCount.total / limit),
      products,
    };
  });

  return c.json(result, HttpStatusCodes.OK);
};

export const get: RouteHandler<GetProductRoute> = async (c) => {
  const id = c.req.param('id');
  const prod = await db.query.product.findFirst({
    with: {
      productImage: true,
      productModel: true,
      productAttributeValue: true,
    },
    where: eq(productVariant.id, id),
  });

  if (!prod) {
    return c.json({ message: 'Product not found!' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(prod, HttpStatusCodes.OK);
};

export const patch: RouteHandler<PatchProductRoute> = async (c) => {
  const id = c.req.param('id');
  const updates = c.req.valid('json');

  if (!Object.values(updates).some(Boolean)) {
    return c.json({ message: 'No valid updates provided' }, HttpStatusCodes.BAD_REQUEST);
  }

  const updated = await db.transaction(async (tx) => {
    const [prod] = await tx
      .update(productVariant)
      .set({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        stock: updates.stock,
        isAvailable: updates.isAvailable,
        categoryId: updates.categoryId,
      })
      .where(eq(productVariant.id, id))
      .returning();

    if (!prod)
      return null;

    if (updates.images) {
      const [existingImgs, newImgs] = updates.images.reduce<
        [ProductImage[], NewProductImage[]]
      >(
        ([ex, nw], img) =>
          img.id ? [[...ex, img as ProductImage], nw] : [ex, [...nw, img as NewProductImage]],
        [[], []],
      );

      if (existingImgs.length > 0) {
        await Promise.all(
          existingImgs.map(img =>
            tx
              .update(productImage)
              .set({
                url: img.url,
                alt: img.alt,
                thumbnailUrl: img.thumbnailUrl,
                displayOrder: img.displayOrder,
              })
              .where(eq(productImage.id, img.id)),
          ),
        );
      }

      if (newImgs.length > 0) {
        await tx.insert(productImage).values(newImgs.map(img => ({ ...img, productId: id })));
      }
    }

    if (updates.models) {
      const [existingModels, newModels] = updates.models.reduce<
        [ProductModel[], NewProductModel[]]
      >(
        ([ex, nw], m) =>
          m.id ? [[...ex, m as ProductModel], nw] : [ex, [...nw, m as NewProductModel]],
        [[], []],
      );

      if (existingModels.length > 0) {
        await Promise.all(
          existingModels.map(m =>
            tx
              .update(productModel)
              .set({
                url: m.url,
                thumbnailUrl: m.thumbnailUrl,
                displayOrder: m.displayOrder,
              })
              .where(eq(productModel.id, m.id)),
          ),
        );
      }

      if (newModels.length > 0) {
        await tx.insert(productModel).values(newModels.map(m => ({ ...m, productId: id })));
      }
    }

    if (updates.attributes) {
      const [existingAttrs, newAttrs] = updates.attributes.reduce<
        [ProductAttributeValue[], NewProductAttributeValue[]]
      >(
        ([ex, nw], a) =>
          a.id ? [[...ex, a as ProductAttributeValue], nw] : [ex, [...nw, a as NewProductAttributeValue]],
        [[], []],
      );

      if (existingAttrs.length > 0) {
        await Promise.all(
          existingAttrs.map(a =>
            tx
              .update(productAttributeValue)
              .set({ value: a.value, attributeId: a.attributeId })
              .where(eq(productAttributeValue.id, a.id)),
          ),
        );
      }

      if (newAttrs.length > 0) {
        await tx
          .insert(productAttributeValue)
          .values(newAttrs.map(a => ({ ...a, productId: id })));
      }
    }

    return tx.query.product.findFirst({
      with: {
        productImage: true,
        productModel: true,
        productAttributeValue: true,
      },
      where: eq(productVariant.id, id),
    });
  });

  if (!updated) {
    return c.json({ message: 'Product not found' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(updated, HttpStatusCodes.OK);
};

export const remove: RouteHandler<RemoveProductRoute> = async (c) => {
  const id = c.req.param('id');

  const deleted = await db.delete(productVariant).where(eq(productVariant.id, id)).returning();

  if (!deleted.length) {
    return c.json({ message: 'Product not found' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json({ message: 'Deleted successfully' }, HttpStatusCodes.OK);
};
