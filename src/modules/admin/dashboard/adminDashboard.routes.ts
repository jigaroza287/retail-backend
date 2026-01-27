import { Router } from "express";
import { ROLES } from "../../../constants/roles";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";

import {
  getKpis,
  getOrdersChartData,
  getSalesChartData,
} from "./adminDashboard.controller";

const router = Router();

router.use(authenticate, authorize([ROLES.ADMIN]));

router.get("/kpis", getKpis);
router.get("/sales-chart", getSalesChartData);
router.get("/orders-chart", getOrdersChartData);

export default router;
