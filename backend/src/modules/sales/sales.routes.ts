import { Router } from "express";
import { createSale } from "./sales.controller";

const router = Router();

router.post("/", createSale);

export default router;
