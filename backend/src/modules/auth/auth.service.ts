import { pool } from "../../config/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "8h" }
  );

  return token;
};
