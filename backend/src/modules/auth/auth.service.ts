import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db";
import { Role, ROLES } from "../../constants/roles";

export const authenticateUser = async (email: string, password: string) => {
  const query = `
    SELECT id, password, role
    FROM retail.users
    WHERE email = $1
  `;

  const { rows } = await pool.query(query, [email]);

  if (rows.length === 0) return null;

  const user = rows[0];

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
