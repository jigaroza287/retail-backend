import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authorize } from "../../middlewares/role.middleware";
import { getInventory, getInventoryByVariant } from "./inventory.controller";

const router = Router();

router.get(
  "/",
  authorize([ROLES.ADMIN, ROLES.STAFF, ROLES.VIEWER]),
  getInventory
);
router.get("/:variantId", getInventoryByVariant);

export default router;
