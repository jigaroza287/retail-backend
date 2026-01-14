import { Request, Response } from "express";
import { fetchProfitReport, fetchProductProfitReport } from "./reports.service";

export const getProfitReport = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "from and to dates are required" });
    }

    const report = await fetchProfitReport(
      new Date(from as string),
      new Date(to as string)
    );

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch profit report" });
  }
};

export const getProductProfitReport = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res
        .status(400)
        .json({ message: "from and to dates are required" });
    }

    const report = await fetchProductProfitReport(
      new Date(from as string),
      new Date(to as string)
    );

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch product profit report" });
  }
};
