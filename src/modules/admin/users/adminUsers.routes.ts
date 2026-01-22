import { Router } from "express";
import {
  getUsersAdmin,
  patchUserActiveAdmin,
  patchUserRoleAdmin,
} from "./adminUsers.controller";

const router = Router();

router.get("/", getUsersAdmin);
router.patch("/:id/role", patchUserRoleAdmin);
router.patch("/:id/active", patchUserActiveAdmin);

export default router;
