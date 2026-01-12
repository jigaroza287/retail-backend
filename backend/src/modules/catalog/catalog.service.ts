import { prisma } from "../../config/prisma";

/**
 * Categories
 */
export const fetchCategories = async () => {
  const categories = await prisma.categories.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      parent_id: true,
    },
  });
  return buildTree(categories);
};

/**
 * Create Product
 */
export const insertProduct = async (name: string, categoryId: string) => {
  return prisma.products.create({
    data: {
      name,
      category_id: categoryId,
    },
    select: {
      id: true,
      name: true,
      category_id: true,
    },
  });
};

/**
 * Create Variant
 */
export const insertVariant = async (
  productId: string,
  size: string | null,
  color: string | null,
  sku: string
) => {
  return prisma.product_variants.create({
    data: {
      product_id: productId,
      size,
      color,
      sku,
    },
    select: {
      id: true,
      product_id: true,
      size: true,
      color: true,
      sku: true,
    },
  });
};

/**
 * Fetch products with variants
 */
export const fetchProductsWithVariants = async (categoryId?: string) => {
  return prisma.products.findMany({
    where: categoryId ? { category_id: categoryId } : undefined,
    select: {
      id: true,
      name: true,
      category_id: true,
      product_variants: true,
    },
  });
};

/**
 * Fetch products with variants
 */

export async function createProductWithVariant(
  name: string,
  categoryId: string,
  size: string,
  color: string,
  sku: string
) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.products.create({
      data: {
        name,
        category_id: categoryId,
      },
    });

    const variant = await tx.product_variants.create({
      data: {
        product_id: product.id,
        size,
        color,
        sku,
      },
    });

    return {
      product,
      variant,
    };
  });
}

/**
 * Helpers
 */
const buildTree = (rows: any[]) => {
  const map = new Map();
  const roots: any[] = [];

  rows.forEach((row) => {
    map.set(row.id, { ...row, children: [] });
  });

  rows.forEach((row) => {
    if (row.parent_id) {
      map.get(row.parent_id)?.children.push(map.get(row.id));
    } else {
      roots.push(map.get(row.id));
    }
  });

  return roots;
};

const groupProducts = (rows: any[]) => {
  const productsMap = new Map<string, any>();

  rows.forEach((row) => {
    if (!productsMap.has(row.product_id)) {
      productsMap.set(row.product_id, {
        id: row.product_id,
        name: row.product_name,
        category: row.category_name,
        variants: [],
      });
    }

    if (row.variant_id) {
      productsMap.get(row.product_id).variants.push({
        id: row.variant_id,
        size: row.size,
        color: row.color,
        sku: row.sku,
      });
    }
  });

  return Array.from(productsMap.values());
};
