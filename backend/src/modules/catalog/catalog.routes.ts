import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import {
  createProduct,
  createVariant,
  getCategories,
  getProducts,
} from "./catalog.controller";

const router = Router();

router.get("/categories", getCategories);

// products
router.post(
  "/products",
  authenticate,
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  createProduct
);
router.get("/products", getProducts);

// variants
router.post(
  "/products/:productId/variants",
  authenticate,
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  createVariant
);

export default router;
