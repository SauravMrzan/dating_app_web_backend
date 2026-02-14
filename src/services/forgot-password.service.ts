import jwt from "jsonwebtoken";
import ResetTokenModel from "../models/resetToken.model";
import { sendEmail } from "../utils/email";
import { UserModel } from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5001";
// fallback to your frontend dev server

export class ForgotPasswordService {
  async sendResetEmail(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error("User not found");

    // Generate token (expires in 15 minutes)
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "15m" });

    // Save token in DB
    await ResetTokenModel.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    // Build reset link using FRONTEND_URL
    const resetLink = `${FRONTEND_URL}/reset-password/${token}`;

    // Send email
    await sendEmail(
      email,
      "Password Reset",
      `
        <p>Hello ${user.fullName || ""},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 15 minutes.</p>
      `,
    );

    return token; // exposed for testing
  }
}
