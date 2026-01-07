import { pool } from "../../config/db";

/**
 * Categories
 */
export const fetchCategories = async () => {
  const query = `
    SELECT id, name, parent_id
    FROM retail.categories
    ORDER BY name;
  `;

  const { rows } = await pool.query(query);
  return buildTree(rows);
};

/**
 * Create Product
 */
export const insertProduct = async (
  id: string,
  name: string,
  categoryId: string
) => {
  const query = `
    INSERT INTO retail.products (id, name, category_id)
    VALUES ($1, $2, $3);
  `;

  await pool.query(query, [id, name, categoryId]);
};

/**
 * Create Variant
 */
export const insertVariant = async (
  id: string,
  productId: string,
  size: string | null,
  color: string | null,
  sku: string
) => {
  const query = `
    INSERT INTO retail.product_variants
      (id, product_id, size, color, sku)
    VALUES ($1, $2, $3, $4, $5);
  `;

  await pool.query(query, [id, productId, size, color, sku]);
};

/**
 * Fetch products with variants
 */
export const fetchProductsWithVariants = async () => {
  const query = `
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      c.name AS category_name,
      v.id AS variant_id,
      v.size,
      v.color,
      v.sku
    FROM retail.products p
    LEFT JOIN retail.categories c ON p.category_id = c.id
    LEFT JOIN retail.product_variants v ON p.id = v.product_id
    ORDER BY p.name;
  `;

  const { rows } = await pool.query(query);
  return groupProducts(rows);
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
