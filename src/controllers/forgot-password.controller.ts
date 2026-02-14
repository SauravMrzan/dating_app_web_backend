import { Request, Response } from "express";
import { ForgotPasswordService } from "../services/forgot-password.service";

const forgotPasswordService = new ForgotPasswordService();

export class ForgotPasswordController {
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const token = await forgotPasswordService.sendResetEmail(email);

      return res.status(200).json({
        success: true,
        message: "Reset email sent",
        token, // exposed for testing
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
