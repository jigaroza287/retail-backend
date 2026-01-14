import { Request, Response } from "express";
import { authenticateUser } from "./auth.service";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const token = await authenticateUser(email, password);

    if (!token) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Login failed" });
  }
};
