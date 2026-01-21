import { Request, Response } from "express";
import { ApiError } from "../../../utils/apiError";
import {
  fetchOrderByIdAdmin,
  fetchOrdersAdmin,
  updateAdminOrderStatus,
} from "./adminOrders.service";

export const getOrdersAdmin = async (req: Request, res: Response) => {
  const filters = {
    search: req.query.search as string | undefined,
    status: req.query.status as string | undefined,
    fromDate: req.query.fromDate
      ? new Date(req.query.fromDate as string)
      : undefined,
    toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 20,
  };

  const result = await fetchOrdersAdmin(filters);

  res.json(result);
};

export const getOrderAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Order id is required" });
  }

  const order = await fetchOrderByIdAdmin(id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
};

export const updateOrderStatusAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Order id is required" });
  }

  try {
    const updated = await updateAdminOrderStatus(id, status);
    return res.json(updated);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
  }
};
