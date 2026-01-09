import { pool } from "../../config/db";

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

    const totalAmount = items.reduce(
      (sum, item) => sum + item.quantity * item.costPrice,
      0
    );

    // 1️⃣ Create purchase order
    const { rows } = await client.query(
      `
      INSERT INTO retail.purchase_orders
        (distributor_id, total_amount, purchased_at)
      VALUES ($1, $2, NOW())
      RETURNING id;
      `,
      [distributorId, totalAmount]
    );

    const purchaseOrderId = rows[0].id;

    // 2️⃣ Create purchase items
    for (const item of items) {
      await client.query(
        `
        INSERT INTO retail.purchase_items
          (purchase_order_id, product_variant_id, quantity, cost_price)
        VALUES ($1, $2, $3, $4)
        `,
        [purchaseOrderId, item.productVariantId, item.quantity, item.costPrice]
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
