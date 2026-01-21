import { prisma } from "../../../config/prisma";
import { OrderStatus } from "../../../constants/orderStatus";
import { ApiError } from "../../../utils/apiError";
import { canTransition } from "../../../utils/orderStatus";
import { revertSaleItems } from "../../inventory/inventory.service";
import { AdminOrder } from "./adminOrders.types";

export type OrderFilters = {
  search?: string;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
  page: number;
  limit: number;
};

export async function fetchOrdersAdmin(
  filters: OrderFilters,
): Promise<{ data: AdminOrder[]; total: number }> {
  const { search, status, fromDate, toDate, page, limit } = filters;

  const where = {
    status: status ?? undefined,
    sold_at: {
      gte: fromDate,
      lte: toDate,
    },
    customers: search
      ? {
          is: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search, mode: "insensitive" as const } },
            ],
          },
        }
      : undefined,
  };

  const total = await prisma.sales_orders.count({ where });

  const orders = await prisma.sales_orders.findMany({
    where,
    include: {
      customers: true,
      sale_items: {
        include: {
          product_variants: {
            include: { products: true },
          },
        },
      },
    },
    orderBy: { sold_at: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const data: AdminOrder[] = orders.map((o) => ({
    id: o.id,
    customerName: o.customers?.name ?? null,
    customerPhone: o.customers?.phone ?? null,
    totalAmount: Number(o.total_amount),
    status: o.status,
    soldAt: o.sold_at,
    items: o.sale_items.map((i) => ({
      variantId: i.product_variant_id,
      sku: i.product_variants.sku,
      quantity: i.quantity,
      sellingPrice: Number(i.selling_price),
      productName: i.product_variants.products.name,
    })),
  }));

  return { data, total };
}

export async function fetchOrderByIdAdmin(
  id: string,
): Promise<AdminOrder | null> {
  const o = await prisma.sales_orders.findUnique({
    where: { id },
    include: {
      customers: true,
      sale_items: {
        include: {
          product_variants: {
            include: { products: true },
          },
        },
      },
    },
  });

  if (!o) return null;

  return {
    id: o.id,
    customerName: o.customers?.name ?? null,
    customerPhone: o.customers?.phone ?? null,
    totalAmount: Number(o.total_amount),
    status: o.status,
    soldAt: o.sold_at,
    items: o.sale_items.map((i) => ({
      variantId: i.product_variant_id,
      sku: i.product_variants.sku,
      quantity: i.quantity,
      sellingPrice: Number(i.selling_price),
      productName: i.product_variants.products.name,
    })),
  };
}

export async function updateAdminOrderStatus(
  id: string,
  newStatus: OrderStatus,
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.sales_orders.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!order) {
      const error: ApiError = new ApiError(
        "Order not found",
        500,
        "ORDER_NOT_FOUND",
      );
      throw error;
    }

    if (!canTransition(order.status as OrderStatus, newStatus)) {
      const error: ApiError = new ApiError(
        `Invalid transition: ${order.status} → ${newStatus}`,
        500,
        "INVALID_STATUS_TRANSITION",
      );
      throw error;
    }

    // Stock revert only on cancel
    if (newStatus === "cancelled") {
      await revertSaleItems(tx, id);
    }

    return tx.sales_orders.update({
      where: { id },
      data: { status: newStatus },
    });
  });
}
