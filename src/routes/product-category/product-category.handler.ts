/* eslint-disable ts/no-non-null-asserted-optional-chain */
import type { RouteHandler } from '@hono/zod-openapi';
import type { InferSelectModel } from 'drizzle-orm';

import { count, eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import { db } from '@/db';
import { productCategory, productCategoryAttribute } from '@/db/schema';

import type {
  CreateProductCategorysRoute,
  GetProductCategoryRoute,
  ListProductCategorysRoute,
  PatchProductCategoryRoute,
  RemoveProductCategoryRoute,
} from './product-category.route';

type ProductCategoryAttribute = InferSelectModel<typeof productCategoryAttribute>;

interface ExistingAttribute extends ProductCategoryAttribute {
  id: string;
}

interface NewAttribute extends Omit<ProductCategoryAttribute, 'id'> {
  attributeName: string;
}

export const create: RouteHandler<CreateProductCategorysRoute> = async (c) => {
  const productCategoryInput = c.req.valid('json');
  const result = await db.transaction(async (transaction) => {
    const [newProductCategory] = await transaction
      .insert(productCategory)
      .values({ ...productCategoryInput })
      .returning();
    const newProductCategoryAttributeInput = productCategoryInput.attributes.map(pa => ({
      ...pa,
      productCategoryId: newProductCategory?.id!,
    }));
    const newProductCategoryAttribute = await transaction
      .insert(productCategoryAttribute)
      .values(newProductCategoryAttributeInput)
      .returning();

    return {
      ...newProductCategory!,
      attributes: newProductCategoryAttribute,
    };
  });

  return c.json(result, HttpStatusCodes.CREATED);
};

export const list: RouteHandler<ListProductCategorysRoute> = async (c) => {
  const { page } = c.req.valid('query');
  const limit = 20;
  const offset = (page - 1) * limit;

  const result = await db.transaction(async (transaction) => {
    const [categoryCount] = await transaction
      .select({ total: count(productCategory.id) })
      .from(productCategory);

    if (!categoryCount) {
      return {
        currentPage: page,
        totalPages: 0,
        productCategories: [],
      };
    }

    const productCategories = await transaction.query.productCategory.findMany({
      offset,
      limit,
    });

    return {
      currentPage: page / limit,
      totalPages: categoryCount.total,
      productCategories,
    };
  });

  return c.json(result, HttpStatusCodes.OK);
};

export const get: RouteHandler<GetProductCategoryRoute> = async (c) => {
  const id = c.req.param('id');
  const category = await db.query.productCategory.findFirst({
    with: { productCategoryAttribute: true },
    where: eq(productCategory.id, id),
  });

  if (!category) {
    return c.json({ message: 'Product category not found!' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(category, HttpStatusCodes.OK);
};

export const patch: RouteHandler<PatchProductCategoryRoute> = async (c) => {
  const id = c.req.param('id');
  const updates = c.req.valid('json');

  if (!Object.values(updates).some(Boolean)) {
    return c.json({ message: 'No valid updates provided' }, HttpStatusCodes.BAD_REQUEST);
  }

  const updatedCategory = await db.transaction(async (tx) => {
    const [category] = await tx
      .update(productCategory)
      .set({ name: updates.name })
      .where(eq(productCategory.id, id))
      .returning();

    if (!category)
      return null;

    if (updates.attributes) {
      const [existingAttributes, newAttributes] = updates.attributes.reduce<
        [ExistingAttribute[], NewAttribute[]]
      >(
        ([yes, no], attr) =>
          attr.id
            ? [[...yes, attr as ExistingAttribute], no]
            : [yes, [...no, attr as NewAttribute]],
        [[], []],
      );

      if (existingAttributes.length > 0) {
        await Promise.all(
          existingAttributes.map((attr) => {
            return tx
              .update(productCategoryAttribute)
              .set({ attributeName: attr.attributeName })
              .where(eq(productCategoryAttribute.id, attr.id));
          }),
        );
      }

      if (newAttributes.length > 0) {
        await tx
          .insert(productCategoryAttribute)
          .values(newAttributes.map(attr => ({ ...attr, productCategoryId: id })));
      }

      const attributes = await tx
        .select()
        .from(productCategoryAttribute)
        .where(eq(productCategoryAttribute.productCategoryId, id));

      return { ...category, attributes }!;
    }

    const attributes = await tx
      .select()
      .from(productCategoryAttribute)
      .where(eq(productCategoryAttribute.productCategoryId, id));
    return { ...category, attributes };
  });

  if (!updatedCategory) {
    return c.json({ message: 'Not found' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(updatedCategory, HttpStatusCodes.OK);
};

export const remove: RouteHandler<RemoveProductCategoryRoute> = async (c) => {
  const id = c.req.param('id');

  const deleted = await db
    .delete(productCategoryAttribute)
    .where(eq(productCategoryAttribute.productCategoryId, id));

  if (!deleted) {
    return c.json({ message: 'Not found' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json({ message: 'Deleted successfully' }, HttpStatusCodes.OK);
};
