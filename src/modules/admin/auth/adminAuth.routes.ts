import { Router } from "express";
import { ROLES } from "../../../constants/roles";
import { authenticate } from "../../../middlewares/auth.middleware";
import { authorize } from "../../../middlewares/role.middleware";
import { adminLogin, adminLogout, adminMe } from "./adminAuth.controller";

const router = Router();

router.post("/login", adminLogin);

router.get("/me", authenticate, authorize([ROLES.ADMIN]), adminMe);

router.post("/logout", authenticate, authorize([ROLES.ADMIN]), adminLogout);

export default router;
