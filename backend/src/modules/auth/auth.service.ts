import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma";
import { Role, ROLES } from "../../constants/roles";

export const authenticateUser = async (email: string, password: string) => {
  const user = await prisma.users.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
      role: true,
    },
  });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  if (!Object.values(ROLES).includes(user.role)) {
    throw new Error("Invalid role assigned to user");
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role as Role },
    process.env.JWT_SECRET as string,
    { expiresIn: "8h" }
  );

  return token;
};
