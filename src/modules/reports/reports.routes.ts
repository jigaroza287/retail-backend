import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/role.middleware";
import { getProductProfitReport, getProfitReport } from "./reports.controller";

const router = Router();

router.get("/profit", authenticate, authorize([ROLES.ADMIN]), getProfitReport);
router.get(
  "/profit/products",
  authenticate,
  authorize([ROLES.ADMIN]),
  getProductProfitReport
);

export default router;
