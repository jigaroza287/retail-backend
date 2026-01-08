import { pool } from "../../config/db";

/**
 * Inventory for all variants
 */
export const fetchInventory = async () => {
  const query = `
    SELECT
      pv.id AS variant_id,
      pv.sku,
      COALESCE(SUM(pi.quantity), 0) -
      COALESCE(SUM(si.quantity), 0) AS available
    FROM retail.product_variants pv
    LEFT JOIN retail.purchase_items pi
      ON pv.id = pi.product_variant_id
    LEFT JOIN retail.sale_items si
      ON pv.id = si.product_variant_id
    GROUP BY pv.id, pv.sku
    ORDER BY pv.sku;
  `;

  const { rows } = await pool.query(query);
  return rows;
};

/**
 * Inventory for a single variant
 */
export const fetchInventoryForVariant = async (variantId: string) => {
  const query = `
    SELECT
      pv.id AS variant_id,
      pv.sku,
      COALESCE(SUM(pi.quantity), 0) -
      COALESCE(SUM(si.quantity), 0) AS available
    FROM retail.product_variants pv
    LEFT JOIN retail.purchase_items pi
      ON pv.id = pi.product_variant_id
    LEFT JOIN retail.sale_items si
      ON pv.id = si.product_variant_id
    WHERE pv.id = $1
    GROUP BY pv.id, pv.sku;
  `;

  const { rows } = await pool.query(query, [variantId]);
  return rows[0] ?? { variantId, available: 0 };
};
