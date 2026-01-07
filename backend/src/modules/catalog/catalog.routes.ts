import { Router } from "express";
import {
  getCategories,
  createProduct,
  createVariant,
  getProducts,
} from "./catalog.controller";

const router = Router();

router.get("/categories", getCategories);

// products
router.post("/products", createProduct);
router.get("/products", getProducts);

// variants
router.post("/products/:productId/variants", createVariant);

export default router;
