import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../../middlewares/auth.middleware";
import { authenticateUser } from "../../auth/auth.service";

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authenticateUser(email, password);

  // Ensure only admin can login
  if (result?.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access denied" });
  }

  return res.json(result);
};

export const adminMe = async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
};

export const adminLogout = async (_req: Request, res: Response) => {
  // Stateless JWT — logout is client-side only.
  return res.json({ message: "Logged out" });
};
