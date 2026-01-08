import { pool } from "../../config/db";
import { randomUUID } from "crypto";

type PurchaseItem = {
  productVariantId: string;
  quantity: number;
  costPrice: number;
};

export const createPurchaseOrder = async (
  distributorId: string,
  items: PurchaseItem[]
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const purchaseOrderId = randomUUID();

    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.costPrice,
      0
    );

    // 1️⃣ Create purchase order
    await client.query(
      `
      INSERT INTO retail.purchase_orders
        (id, distributor_id, total_amount, purchased_at)
      VALUES ($1, $2, $3, NOW())
      `,
      [purchaseOrderId, distributorId, totalAmount]
    );

    // 2️⃣ Create purchase items
    for (const item of items) {
      await client.query(
        `
        INSERT INTO retail.purchase_items
          (id, purchase_order_id, product_variant_id, quantity, cost_price)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          randomUUID(),
          purchaseOrderId,
          item.productVariantId,
          item.quantity,
          item.costPrice,
        ]
      );
    }

    await client.query("COMMIT");

    return {
      id: purchaseOrderId,
      distributorId,
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
