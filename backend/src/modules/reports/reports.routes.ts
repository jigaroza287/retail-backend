import { Router } from "express";
import { getProfitReport, getProductProfitReport } from "./reports.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/profit", authenticate, getProfitReport);
router.get("/profit/products", authenticate, getProductProfitReport);

export default router;
