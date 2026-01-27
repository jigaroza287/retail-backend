import { format, subDays } from "date-fns";
import { prisma } from "../../../config/prisma";
import { ChartPoint, DashboardKpis } from "./adminDashboard.types";

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const [orderCount, totalRevenue, activeUsers] = await Promise.all([
    prisma.sales_orders.count(),
    prisma.sales_orders.aggregate({
      _sum: { total_amount: true },
    }),
    prisma.users.count({
      where: { is_active: true },
    }),
  ]);

  return {
    totalSales: orderCount,
    totalRevenue: Number(totalRevenue._sum.total_amount ?? 0),
    totalOrders: orderCount,
    activeUsers,
  };
}

export async function getSalesChart(): Promise<ChartPoint[]> {
  const since = subDays(new Date(), 30);

  const rows = await prisma.sales_orders.groupBy({
    by: ["sold_at"],
    _sum: { total_amount: true },
    where: {
      sold_at: { gte: since },
    },
    orderBy: { sold_at: "asc" },
  });

  return rows.map((row) => ({
    date: format(row.sold_at, "yyyy-MM-dd"),
    value: Number(row._sum.total_amount ?? 0),
  }));
}

export async function getOrdersChart(): Promise<ChartPoint[]> {
  const since = subDays(new Date(), 30);

  const rows = await prisma.sales_orders.groupBy({
    by: ["sold_at"],
    _count: { id: true },
    where: {
      sold_at: { gte: since },
    },
    orderBy: { sold_at: "asc" },
  });

  return rows.map((row) => ({
    date: format(row.sold_at, "yyyy-MM-dd"),
    value: row._count.id,
  }));
}
