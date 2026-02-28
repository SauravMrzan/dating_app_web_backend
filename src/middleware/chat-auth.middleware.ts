// middleware/chatAuthMiddleware.ts
import { Request, Response, NextFunction } from "express";
import {MatchModel} from "../models/match.model";

/**
 * Middleware to ensure that the current user is allowed to chat
 * with the given friendId. Only mutual matches are permitted.
 */
export async function chatAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const fromUserId = (req as any).user?._id;

  // ✅ Use body for POST, params for GET
  const toUserId = req.body?.toUserId || req.params?.friendId;

  if (!toUserId) {
    return res.status(400).json({
      success: false,
      message: "Recipient userId (toUserId) is required",
    });
  }

  try {
    // ✅ Allow chat only if a mutual match exists
    const match = await MatchModel.findOne({
      $or: [
        { fromUser: fromUserId, toUser: toUserId, isMutual: true },
        { fromUser: toUserId, toUser: fromUserId, isMutual: true },
      ],
    });

    if (!match) {
      return res.status(403).json({
        success: false,
        message: "You can only chat with mutual matches.",
      });
    }

    next();
  } catch (err) {
    console.error("❌ CHAT_AUTH_ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
