import { Router } from "express";
import { ROLES } from "../../../constants/roles";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";

import {
  getOrderAdmin,
  getOrdersAdmin,
  updateOrderStatusAdmin,
} from "./adminOrders.controller";

const router = Router();

router.use(authenticate, authorize([ROLES.ADMIN]));

router.get("/", getOrdersAdmin);
router.get("/:id", getOrderAdmin);
router.patch("/:id/status", updateOrderStatusAdmin);

export default router;
