import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { decreaseStock } from "../inventory/inventory.service";

type SaleItem = {
  productVariantId: string;
  quantity: number;
  sellingPrice: number;
};

export const createSalesOrder = async (
  customerId: string | null,
  items: SaleItem[]
) => {
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.sellingPrice,
    0
  );

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const saleOrder = await tx.sales_orders.create({
      data: {
        customer_id: customerId,
        total_amount: totalAmount,
        sold_at: new Date(),
      },
    });

    for (const item of items) {
      await decreaseStock(
        tx,
        item.productVariantId,
        item.quantity,
        item.sellingPrice,
        saleOrder.id
      );
    }
  });
};
