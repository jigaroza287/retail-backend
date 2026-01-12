import { Prisma } from "@prisma/client";
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

async function getAvailableStock(
  tx: Prisma.TransactionClient,
  variantId: string
): Promise<number> {
  const [result] = await tx.$queryRaw<{ available: number }[]>`
    SELECT
      COALESCE(SUM(pi.quantity), 0) -
      COALESCE(SUM(si.quantity), 0) AS available
    FROM retail.product_variants pv
    LEFT JOIN retail.purchase_items pi
      ON pv.id = pi.product_variant_id
    LEFT JOIN retail.sale_items si
      ON pv.id = si.product_variant_id
    WHERE pv.id = ${variantId}
    GROUP BY pv.id
  `;

  return result?.available ?? 0;
}

export async function increaseStock(
  tx: Prisma.TransactionClient,
  variantId: string,
  quantity: number,
  costPrice: number,
  purchaseOrderId: string
) {
  return tx.purchase_items.create({
    data: {
      purchase_order_id: purchaseOrderId,
      product_variant_id: variantId,
      quantity,
      cost_price: costPrice,
    },
  });
}

export async function decreaseStock(
  tx: Prisma.TransactionClient,
  variantId: string,
  quantity: number,
  unitPrice: number,
  saleOrderId: string
) {
  const available = await getAvailableStock(tx, variantId);

  if (available < quantity) {
    throw new Error("Insufficient stock");
  }

  return tx.sale_items.create({
    data: {
      sales_order_id: saleOrderId,
      product_variant_id: variantId,
      quantity,
      selling_price: unitPrice,
    },
  });
}
