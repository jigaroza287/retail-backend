import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError";
import { mapDbError } from "../../utils/dbErrorMapper";
import { createSalesOrder } from "./sales.service";

export const createSale = async (req: Request, res: Response) => {
  try {
    const { customerId, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Invalid sale payload" });
    }

    const sale = await createSalesOrder(customerId, items);
    res.status(201).json(sale);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error(error);
    const apiError = mapDbError(error, "Failed to create sale");
    return res.status(apiError.statusCode).json({ message: apiError.message });
  }
};
