import { Request, Response } from "express";
import { createPurchaseOrder } from "./purchases.service";

export const createPurchase = async (req: Request, res: Response) => {
  try {
    const { distributorId, items } = req.body;

    if (!distributorId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid purchase payload" });
    }

    const purchase = await createPurchaseOrder(distributorId, items);
    res.status(201).json(purchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create purchase" });
  }
};
