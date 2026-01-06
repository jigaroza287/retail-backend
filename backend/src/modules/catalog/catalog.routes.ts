import { Router } from "express";
import { getCategories } from "./catalog.controller";

const router = Router();

router.get("/categories", getCategories);

export default router;
