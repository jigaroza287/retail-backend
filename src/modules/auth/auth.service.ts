import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { Role, ROLES } from "../../constants/roles";

function isRole(value: string): value is Role {
  return Object.values(ROLES).includes(value as Role);
}

export const authenticateUser = async (email: string, password: string) => {
  const user = await prisma.users.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  if (!isRole(user.role)) {
    throw new Error("Invalid role assigned to user");
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "8h" }
  );

  return { token, user: { id: user.id, email, role: user.role } };
};
