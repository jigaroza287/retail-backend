import { Request, Response } from "express";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchProductByIdAdmin,
  fetchProductsAdmin,
  ProductFilters,
  updateAdminProduct,
} from "./adminProducts.service";

export const getProductsAdmin = async (req: Request, res: Response) => {
  const filters: ProductFilters = {
    search: req.query.search as string | undefined,
    categoryId: req.query.categoryId as string | undefined,
    minStock: req.query.minStock ? Number(req.query.minStock) : undefined,
    maxStock: req.query.maxStock ? Number(req.query.maxStock) : undefined,
    sortBy: req.query.sortBy as ProductFilters["sortBy"],
    sortOrder: req.query.sortOrder as ProductFilters["sortOrder"],
  };

  const products = await fetchProductsAdmin;
  filters;
  res.json({ data: products });
};

export const getProductAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Category id is required" });
  }

  const product = await fetchProductByIdAdmin(id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
};

export const createProductAdmin = async (req: Request, res: Response) => {
  const result = await createAdminProduct(req.body);
  return res.status(201).json(result);
};

export const updateProductAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Category id is required" });
  }

  const result = await updateAdminProduct(id, req.body);
  return res.json(result);
};

export const deleteProductAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Category id is required" });
  }

  await deleteAdminProduct(id);
  return res.json({ message: "Product deleted" });
};
