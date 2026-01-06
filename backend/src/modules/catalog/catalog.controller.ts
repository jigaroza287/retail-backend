import { Request, Response } from "express";
import { fetchCategories } from "./catalog.service";

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await fetchCategories();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};
