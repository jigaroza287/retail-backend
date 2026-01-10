import { Request, Response } from "express";
import {
  fetchCategories,
  fetchProductsWithVariants,
  insertProduct,
  insertVariant,
} from "./catalog.service";

/**
 * Categories
 */
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await fetchCategories();
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

/**
 * Create Product (Design)
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res
        .status(400)
        .json({ message: "name and categoryId are required" });
    }

    const productId = await insertProduct(name, categoryId);

    res.status(201).json({
      id: productId,
      name,
      categoryId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create product" });
  }
};

/**
 * Create Product Variant (SKU)
 */
export const createVariant = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { size, color, sku } = req.body;

    if (!sku) {
      return res.status(400).json({ message: "sku is required" });
    }

    if (!productId || typeof productId !== "string") {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const variantId = await insertVariant(productId, size, color, sku);

    res.status(201).json({
      id: variantId,
      productId,
      size,
      color,
      sku,
    });
  } catch (error: any) {
    if (error.code === "23505") {
      // unique violation
      return res.status(409).json({ message: "SKU already exists" });
    }

    console.error(error);
    res.status(500).json({ message: "Failed to create variant" });
  }
};

/**
 * Get Products with Variants
 */
export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await fetchProductsWithVariants();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};
