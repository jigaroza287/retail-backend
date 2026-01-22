import { Request, Response } from "express";
import {
  fetchUsersAdmin,
  updateUserActiveAdmin,
  updateUserRoleAdmin,
} from "./adminUsers.service";

export const getUsersAdmin = async (req: Request, res: Response) => {
  try {
    const { role, active, search, page = "1", limit = "10" } = req.query;

    const filters = {
      role: typeof role === "string" ? role : undefined,
      active: typeof active === "string" ? active === "true" : undefined,
      search: typeof search === "string" ? search : undefined,
      page: Number(page),
      limit: Number(limit),
    };

    const result = await fetchUsersAdmin(filters);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const patchUserRoleAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "User id is required" });
    }

    if (!role || typeof role !== "string") {
      return res.status(400).json({ message: "User role is required" });
    }
    const updatedUser = await updateUserRoleAdmin(id, role);
    return res.json(updatedUser);
  } catch (error: unknown) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update user role" });
  }
};

export const patchUserActiveAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "User id is required" });
    }

    console.log(`active: ${active}, typeof active: ${typeof active}`);

    if (active === undefined || typeof active !== "boolean") {
      return res
        .status(400)
        .json({ message: "User active status is required" });
    }
    const updatedUser = await updateUserActiveAdmin(id, active);
    return res.json(updatedUser);
  } catch (error: unknown) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to update user active status" });
  }
};
