import { Request, Response } from "express";
import { mapDbError } from "../../utils/dbErrorMapper";
import { getOptionalStringQuery } from "../../utils/request";
import {
  fetchCategories,
  fetchProductsWithVariants,
  insertProduct,
  insertVariant,
} from "./catalog.service";

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await fetchCategories();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    let name: string | undefined;
    let categoryId: string | undefined;

    try {
      name = getOptionalStringQuery(req.body.name);
      if (!name) {
        return res.status(400).json({ message: "name is required" });
      }
    } catch {
      return res.status(400).json({ message: "Invalid product name" });
    }

    try {
      categoryId = getOptionalStringQuery(req.body.categoryId);
      if (!categoryId) {
        return res.status(400).json({ message: "categoryId is required" });
      }
    } catch {
      return res.status(400).json({ message: "Invalid categoryId" });
    }

    const product = await insertProduct(name, categoryId);

    res.status(201).json(product);
  } catch (error) {
    const apiError = mapDbError(error, "Failed to create product");
    return res.status(apiError.statusCode).json({ message: apiError.message });
  }
};

export const createVariant = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { size, color, sku } = req.body;

    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ message: "Invalid productId" });
    }

    if (!size || !color || !sku) {
      return res.status(400).json({ message: "Missing variant fields" });
    }

    const variant = await insertVariant(productId, size, color, sku);

    res.status(201).json(variant);
  } catch (error: unknown) {
    const apiError = mapDbError(error, "Failed to create variant");
    return res.status(apiError.statusCode).json({ message: apiError.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    let categoryId: string | undefined;

    try {
      categoryId = getOptionalStringQuery(req.query.categoryId);
    } catch {
      return res.status(400).json({ message: "Invalid categoryId" });
    }

    const products = await fetchProductsWithVariants(categoryId);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};
