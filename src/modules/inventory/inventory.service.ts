import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { InsufficientStockError } from "../../utils/apiError";

export const fetchInventory = async () => {
  return prisma.$queryRaw<
    { variant_id: string; sku: string; available: number }[]
  >`
    SELECT
      pv.id AS variant_id,
      pv.sku,
      (
        COALESCE(SUM(pi.quantity), 0) -
        COALESCE(SUM(si.quantity), 0)
      )::INT AS available
    FROM retail.product_variants pv
    LEFT JOIN retail.purchase_items pi
      ON pv.id = pi.product_variant_id
    LEFT JOIN retail.sale_items si
      ON pv.id = si.product_variant_id
    GROUP BY pv.id, pv.sku
    ORDER BY pv.sku;
  `;
};

export const fetchInventoryForVariant = async (variantId: string) => {
  return prisma.$queryRaw<
    { variant_id: string; sku: string; available: number }[]
  >`
    SELECT
      pv.id AS variant_id,
      pv.sku,
      (
        COALESCE(SUM(pi.quantity), 0) -
        COALESCE(SUM(si.quantity), 0)
      )::INT AS available
    FROM retail.product_variants pv
    LEFT JOIN retail.purchase_items pi
      ON pv.id = pi.product_variant_id
    LEFT JOIN retail.sale_items si
      ON pv.id = si.product_variant_id
    WHERE pv.id = ${variantId}
    GROUP BY pv.id, pv.sku;
  `;
};

async function getAvailableStock(
  tx: Prisma.TransactionClient,
  variantId: string,
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
  purchaseOrderId: string,
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
  saleOrderId: string,
) {
  const available = await getAvailableStock(tx, variantId);

  if (available < quantity) {
    throw new InsufficientStockError();
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

export async function revertSaleItems(
  tx: Prisma.TransactionClient,
  orderId: string,
) {
  const items = await tx.sale_items.findMany({
    where: { sales_order_id: orderId },
    select: {
      product_variant_id: true,
      quantity: true,
      selling_price: true,
    },
  });

  for (const item of items) {
    await tx.sale_items.create({
      data: {
        sales_order_id: orderId,
        product_variant_id: item.product_variant_id,
        quantity: -item.quantity, // negative = revert sale
        selling_price: item.selling_price,
      },
    });
  }
}
