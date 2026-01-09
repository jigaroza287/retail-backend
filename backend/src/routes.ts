import { Router } from "express";
import catalogRoutes from "./modules/catalog/catalog.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import purchasesRoutes from "./modules/purchases/purchases.routes";
import reportsRoutes from "./modules/reports/reports.routes";
import salesRoutes from "./modules/sales/sales.routes";

const router = Router();

router.use("/catalog", catalogRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/purchases", purchasesRoutes);
router.use("/sales", salesRoutes);
router.use("/reports", reportsRoutes);

export default router;
