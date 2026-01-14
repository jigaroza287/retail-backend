import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { createSale } from "./sales.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize([ROLES.ADMIN, ROLES.STAFF]),
  createSale
);

export default router;
