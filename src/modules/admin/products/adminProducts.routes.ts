import { Router } from "express";
import { ROLES } from "../../../constants/roles";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import {
  createProductAdmin,
  deleteProductAdmin,
  getProductAdmin,
  getProductsAdmin,
  updateProductAdmin,
} from "./adminProducts.controller";

const router = Router();

router.get("/", getProductsAdmin);
router.get("/:id", getProductAdmin);
router.post("/", authenticate, authorize([ROLES.ADMIN]), createProductAdmin);
router.put("/:id", authenticate, authorize([ROLES.ADMIN]), updateProductAdmin);
router.delete(
  "/:id",
  authenticate,
  authorize([ROLES.ADMIN]),
  deleteProductAdmin,
);

export default router;
