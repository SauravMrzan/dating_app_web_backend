import { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/user.model";

export const profileCompletionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user._id;
    const user = await UserModel.findById(userId).select("photos bio");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.photos || user.photos.length < 1 || !user.bio) {
      return res.status(400).json({
        success: false,
        message: "Profile incomplete. Please add at least one photo and a bio.",
      });
    }

    next();
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
