import { Request, Response } from "express";
import { UserModel } from "../models/user.model";

export class UserController {
  async deleteAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).user._id;
      await UserModel.findByIdAndUpdate(userId, { isDeleted: true });

      return res.status(200).json({
        success: true,
        message: "Account deleted successfully (soft delete).",
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
