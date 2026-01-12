import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { increaseStock } from "../inventory/inventory.service";

type PurchaseItem = {
  productVariantId: string;
  quantity: number;
  costPrice: number;
};

export const createPurchaseOrder = async (
  distributorId: string,
  items: PurchaseItem[]
) => {
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0
  );
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const purchaseOrder = await tx.purchase_orders.create({
      data: {
        distributor_id: distributorId,
        total_amount: totalAmount,
        purchased_at: Date(),
      },
    });

    for (const item of items) {
      await increaseStock(
        tx,
        item.productVariantId,
        item.quantity,
        item.costPrice,
        purchaseOrder.id
      );
    }
  });
};
