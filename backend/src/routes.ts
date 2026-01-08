import { Router } from "express";
import catalogRoutes from "./modules/catalog/catalog.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
const router = Router();

router.use("/catalog", catalogRoutes);
router.use("/inventory", inventoryRoutes);

export default router;
