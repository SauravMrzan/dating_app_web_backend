import { Request, Response } from "express";
import { ResetPasswordService } from "../services/reset-password.service";

const resetPasswordService = new ResetPasswordService();

export class ResetPasswordController {
  async resetPassword(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      await resetPasswordService.resetPassword(token, newPassword);

      return res.status(200).json({
        success: true,
        message: "Password reset successful",
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
