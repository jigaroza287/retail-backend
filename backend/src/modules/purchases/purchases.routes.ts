import { Router } from "express";
import { createPurchase } from "./purchases.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createPurchase);

export default router;
