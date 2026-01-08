import { Router } from "express";
import catalogRoutes from "./modules/catalog/catalog.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import purchasesRoutes from "./modules/purchases/purchases.routes";

const router = Router();

router.use("/catalog", catalogRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/purchases", purchasesRoutes);

export default router;
