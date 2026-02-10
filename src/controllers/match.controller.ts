import { Request, Response } from "express";
import { MatchService } from "../services/match.service";
import { SwipeDTO } from "../dtos/match.dto";

const matchService = new MatchService();

export class MatchController {
  async getDiscovery(req: Request, res: Response) {
    try {
      const user = (req as any).user; // Set by authorizedMiddleware
      const profiles = await matchService.getDiscovery(user._id, user);
      
      return res.status(200).json({
        success: true,
        data: profiles,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async swipe(req: Request, res: Response) {
    try {
      const fromUserId = (req as any).user._id;

      // Using safeParse pattern from your login method
      const parsedData = SwipeDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: parsedData.error.flatten(),
        });
      }

      const { toUserId, status } = parsedData.data;
      const result = await matchService.swipe(fromUserId, toUserId, status);

      return res.status(200).json({
        success: true,
        isMatch: result.isMatch,
        message: result.isMatch ? "Match found!" : "Swipe recorded",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}