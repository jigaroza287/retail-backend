import { Router } from "express";
import { ROLES } from "../../../constants/roles";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import {
  createCategory,
  deleteCategory,
  getCategoriesAdmin,
  updateCategory,
} from "./adminCategories.controller";

const router = Router();

router.use(authenticate, authorize([ROLES.ADMIN]));

router.get("/", getCategoriesAdmin);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
