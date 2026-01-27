import { Request, Response } from "express";
import {
  getDashboardKpis,
  getOrdersChart,
  getSalesChart,
} from "./adminDashboard.service";

export const getKpis = async (req: Request, res: Response) => {
  try {
    const result = await getDashboardKpis();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load KPIs" });
  }
};

export const getSalesChartData = async (req: Request, res: Response) => {
  try {
    const data = await getSalesChart();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load sales chart" });
  }
};

export const getOrdersChartData = async (req: Request, res: Response) => {
  try {
    const data = await getOrdersChart();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load orders chart" });
  }
};
