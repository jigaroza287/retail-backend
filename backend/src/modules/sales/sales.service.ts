import { pool } from "../../config/db";
import { randomUUID } from "crypto";

type SaleItem = {
  productVariantId: string;
  quantity: number;
  sellingPrice: number;
};

export const createSalesOrder = async (
  customerId: string | null,
  items: SaleItem[]
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Validate stock for each variant
    for (const item of items) {
      const { rows } = await client.query(
        `
        SELECT
          COALESCE(SUM(pi.quantity), 0) -
          COALESCE(SUM(si.quantity), 0) AS available
        FROM retail.product_variants pv
        LEFT JOIN retail.purchase_items pi
          ON pv.id = pi.product_variant_id
        LEFT JOIN retail.sale_items si
          ON pv.id = si.product_variant_id
        WHERE pv.id = $1
        GROUP BY pv.id
        `,
        [item.productVariantId]
      );

      const available = rows[0]?.available ?? 0;

      if (available < item.quantity) {
        const error: any = new Error(
          `Insufficient stock for variant ${item.productVariantId}`
        );
        error.code = "INSUFFICIENT_STOCK";
        throw error;
      }
    }

    // 2️⃣ Create sales order
    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.sellingPrice,
      0
    );

    const { rows } = await client.query(
      `
      INSERT INTO retail.sales_orders
        (customer_id, total_amount, sold_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id
      `,
      [customerId, totalAmount]
    );
    const salesOrderId = rows[0].id;

    // 3️⃣ Create sale items
    for (const item of items) {
      await client.query(
        `
        INSERT INTO retail.sale_items
          (sales_order_id, product_variant_id, quantity, selling_price)
        VALUES ($1, $2, $3, $4)
        `,
        [salesOrderId, item.productVariantId, item.quantity, item.sellingPrice]
      );
    }

    await client.query("COMMIT");

    return {
      id: salesOrderId,
      customerId,
      totalAmount,
      items,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
