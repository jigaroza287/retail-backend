import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../constants/roles";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: Role;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      role: Role;
    };

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
