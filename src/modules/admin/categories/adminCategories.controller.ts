import { Request, Response } from "express";
import {
  createCategoryAdmin,
  deleteCategoryAdmin,
  getAllCategoriesAdmin,
  updateCategoryAdmin,
} from "./adminCategories.service";

export const getCategoriesAdmin = async (_req: Request, res: Response) => {
  const categories = await getAllCategoriesAdmin();
  return res.json({ data: categories });
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, parentId } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ message: "Category name is required" });
  }

  const result = await createCategoryAdmin(name, parentId);
  return res.status(201).json(result);
};

export const updateCategory = async (req: Request, res: Response) => {
  const { name, parentId } = req.body;
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Category id is required" });
  }

  if (!name || typeof name !== "string") {
    return res.status(400).json({ message: "Category name is required" });
  }

  const updated = await updateCategoryAdmin(id, name, parentId);
  return res.json(updated);
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Category id is required" });
  }

  await deleteCategoryAdmin(id);
  return res.json({ message: "Category deleted" });
};
