import { Router } from "express";
import { getInventory, getInventoryByVariant } from "./inventory.controller";

const router = Router();

router.get("/", getInventory);
router.get("/:variantId", getInventoryByVariant);

export default router;
