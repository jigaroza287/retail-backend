import { Router } from "express";
import catalogRoutes from "./modules/catalog/catalog.routes";

const router = Router();

router.use("/catalog", catalogRoutes);

export default router;
