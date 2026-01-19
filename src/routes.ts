import { Router } from "express";
import adminRoutes from "./modules/admin/adminRoutes";
import authRoutes from "./modules/auth/auth.routes";
import catalogRoutes from "./modules/catalog/catalog.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import purchasesRoutes from "./modules/purchases/purchases.routes";
import reportsRoutes from "./modules/reports/reports.routes";
import salesRoutes from "./modules/sales/sales.routes";

const router = Router();

router.use("/admin", adminRoutes);
router.use("/catalog", catalogRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/purchases", purchasesRoutes);
router.use("/sales", salesRoutes);
router.use("/reports", reportsRoutes);
router.use("/auth", authRoutes);

export default router;
