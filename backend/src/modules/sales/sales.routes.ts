import { Router } from "express";
import { createSale } from "./sales.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createSale);

export default router;
