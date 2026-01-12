import { pool } from "../../config/db";
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
  const query = `
    INSERT INTO retail.products (name, category_id)
    VALUES ($1, $2)
    RETURNING id;
  `;

  const { rows } = await pool.query(query, [name, categoryId]);
  return rows[0].id;
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
  const query = `
    INSERT INTO retail.product_variants
      (product_id, size, color, sku)
    VALUES ($1, $2, $3, $4);
    RETURNING id;
  `;

  const { rows } = await pool.query(query, [productId, size, color, sku]);
  return rows[0].id;
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
