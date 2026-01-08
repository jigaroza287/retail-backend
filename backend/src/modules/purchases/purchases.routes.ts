import { Router } from "express";
import { createPurchase } from "./purchases.controller";

const router = Router();

router.post("/", createPurchase);

export default router;
