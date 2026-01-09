import { Router } from "express";
import { getProfitReport, getProductProfitReport } from "./reports.controller";

const router = Router();

router.get("/profit", getProfitReport);
router.get("/profit/products", getProductProfitReport);

export default router;
