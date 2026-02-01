import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { IUser } from "../models/user.model";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";

const userRepository = new UserRepository();

/**
 * PROTECT: This is the first gate.
 * It checks if the "Bearer Token" exists and is valid.
 */
export async function protect(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "Please login to access this resource");
    }

    const token = authHeader.split(" ")[1];
    if (!token) throw new HttpError(401, "Token missing");

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    if (!decoded || !decoded.id)
      throw new HttpError(401, "Invalid token structure");

    const user = await userRepository.getUserById(decoded.id);
    if (!user) throw new HttpError(401, "User no longer exists");

    // Attach user to the request so the next middleware can see it
    req.user = user as IUser;
    return next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }
}

/**
 * IS_ADMIN: This is the second gate.
 * It checks if the user attached by 'protect' has the role 'admin'.
 */
export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    // 'protect' must run before this to populate req.user
    if (!req.user) {
      throw new HttpError(401, "Authentication required");
    }

    if (req.user.role !== "admin") {
      throw new HttpError(403, "Access denied: Admin privileges required");
    }

    return next();
  } catch (err: any) {
    return res.status(err.statusCode || 403).json({
      success: false,
      message: err.message || "Forbidden",
    });
  }
}
