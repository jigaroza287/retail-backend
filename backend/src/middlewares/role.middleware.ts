import { NextFunction, Response } from "express";
import { Role } from "../constants/roles";
import { AuthenticatedRequest } from "./auth.middleware";

export const authorize =
  (allowedRoles: Role[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
