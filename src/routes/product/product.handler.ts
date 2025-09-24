import type { RouteHandler } from '@hono/zod-openapi';

import { count, eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import { db } from '@/db';
import { product, productAttributeValue, productImage, productModel } from '@/db/schema';

import type {
  CreateProductRoute,
  GetProductRoute,
  ListProductsRoute,
  PatchProductRoute,
  RemoveProductRoute,
} from './product.route';

export const create: RouteHandler<CreateProductRoute> = async (c) => {
  const productInput = c.req.valid('json');

  const result = await db.transaction(async (tx) => {
    const [newProduct] = await tx
      .insert(product)
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
      where: eq(product.id, newProduct!.id),
    });
  });

  return c.json(result, HttpStatusCodes.CREATED);
};

export const list: RouteHandler<ListProductsRoute> = async (c) => {
  const { page, categoryId, minPrice, maxPrice, q } = c.req.valid('query');
  const limit = 20;
  const offset = (page - 1) * limit;

  const result = await db.transaction(async (tx) => {
    const [productCount] = await tx.select({ total: count(product.id) }).from(product);

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
    where: eq(product.id, id),
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
      .update(product)
      .set({
        name: updates.name,
        description: updates.description,
        price: updates.price,
        stock: updates.stock,
        isAvailable: updates.isAvailable,
        categoryId: updates.categoryId,
      })
      .where(eq(product.id, id))
      .returning();

    if (!prod)
      return null;

    if (updates.images) {
      await tx.delete(productImage).where(eq(productImage.productId, id));
      await tx
        .insert(productImage)
        .values(updates.images.map(img => ({ ...img, productId: id })));
    }

    if (updates.models) {
      await tx.delete(productModel).where(eq(productModel.productId, id));
      await tx.insert(productModel).values(updates.models.map(m => ({ ...m, productId: id })));
    }

    if (updates.attributes) {
      await tx.delete(productAttributeValue).where(eq(productAttributeValue.productId, id));
      await tx
        .insert(productAttributeValue)
        .values(updates.attributes.map(a => ({ ...a, productId: id })));
    }

    return tx.query.product.findFirst({
      with: {
        productImage: true,
        productModel: true,
        productAttributeValue: true,
      },
      where: eq(product.id, id),
    });
  });

  if (!updated) {
    return c.json({ message: 'Product not found' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(updated, HttpStatusCodes.OK);
};

export const remove: RouteHandler<RemoveProductRoute> = async (c) => {
  const id = c.req.param('id');

  const deleted = await db.delete(product).where(eq(product.id, id)).returning();

  if (!deleted.length) {
    return c.json({ message: 'Product not found' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json({ message: 'Deleted successfully' }, HttpStatusCodes.OK);
};
