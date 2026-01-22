import { prisma } from "../../../config/prisma";
import { AdminUser, UserFilters } from "./adminUsers.types";

export const fetchUsersAdmin = async (filters: UserFilters) => {
  const { role, active, search, page, limit } = filters;
  const where = {
    role: role ?? undefined,
    is_active: active ?? true,
    email: search
      ? { contains: search, mode: "insensitive" as const }
      : undefined,
  };

  const total = await prisma.users.count({ where });

  const users = await prisma.users.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
  });

  const data: AdminUser[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.is_active ?? false,
    createdAt: user.created_at,
  }));

  return { data, total };
};

export const updateUserRoleAdmin = (id: string, role: string) => {
  return prisma.users.update({
    where: { id },
    data: { role },
  });
};

export const updateUserActiveAdmin = (id: string, active: boolean) => {
  return prisma.users.update({
    where: { id },
    data: { is_active: active },
  });
};
