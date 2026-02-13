import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export const generateResetToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "15m" });
};

export const verifyResetToken = (token: string): { id: string } => {
  return jwt.verify(token, JWT_SECRET) as { id: string };
};
