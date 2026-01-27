export interface DashboardKpis {
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  activeUsers: number;
}

export interface ChartPoint {
  date: string; // YYYY-MM-DD
  value: number;
}
