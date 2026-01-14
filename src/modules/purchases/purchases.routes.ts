import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { createPurchase } from "./purchases.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  createPurchase
);

export default router;
