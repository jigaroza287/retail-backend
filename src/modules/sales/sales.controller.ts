import { Request, Response } from "express";
import { createSalesOrder } from "./sales.service";

export const createSale = async (req: Request, res: Response) => {
  try {
    const { customerId, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid sale payload" });
    }

    const sale = await createSalesOrder(customerId, items);
    res.status(201).json(sale);
  } catch (error: any) {
    if (error.code === "INSUFFICIENT_STOCK") {
      return res.status(409).json({ message: error.message });
    }

    console.error(error);
    res.status(500).json({ message: "Failed to create sale" });
  }
};
