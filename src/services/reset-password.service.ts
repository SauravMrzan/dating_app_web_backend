import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import ResetTokenModel from "../models/resetToken.model";
import { UserModel } from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export class ResetPasswordService {
  async resetPassword(token: string, newPassword: string) {
    // Verify token exists in DB
    const resetToken = await ResetTokenModel.findOne({ token });
    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new Error("Invalid or expired token");
    }

    // Decode token safely
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error("Invalid or expired token");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const user = await UserModel.findByIdAndUpdate(
      decoded.id,
      { password: hashedPassword },
      { new: true },
    );
    if (!user) {
      throw new Error("User not found");
    }

    // Delete token after use
    await ResetTokenModel.deleteOne({ token });

    return true;
  }
}
