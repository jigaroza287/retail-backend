import { Request, Response } from "express";
import { fetchInventory, fetchInventoryForVariant } from "./inventory.service";
import { getOptionalStringQuery } from "../../utils/request";

export const getInventory = async (_req: Request, res: Response) => {
  try {
    const inventory = await fetchInventory();
    res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
};

export const getInventoryByVariant = async (req: Request, res: Response) => {
  try {
    let variantId: string | undefined;

    try {
      variantId = getOptionalStringQuery(req.body.name);
      if (!variantId) {
        return res.status(400).json({ message: "variantId is required" });
      }
    } catch {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const inventory = await fetchInventoryForVariant(variantId);
    res.json(inventory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
};
