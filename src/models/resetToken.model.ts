import mongoose, { Schema, Document } from "mongoose";

export interface IResetToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

const ResetTokenSchema = new Schema<IResetToken>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// ✅ Prevent OverwriteModelError
export default mongoose.models.ResetToken ||
  mongoose.model<IResetToken>("ResetToken", ResetTokenSchema);
