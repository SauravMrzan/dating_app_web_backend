import mongoose, { Schema } from "mongoose";
import { IUser } from "../models/user.model";

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    phone: { type: String, required: true },
    culture: {
      type: String,
      enum: ["Brahmin", "Chhetri", "Newar", "Rai", "Magar", "Gurung"],
      required: true,
    },
    interestedIn: {
      type: String,
      enum: ["Male", "Female", "Everyone"],
      required: true,
    },
    preferredCulture: {
      type: [String],
      enum: ["Brahmin", "Chhetri", "Newar", "Rai", "Magar", "Gurung"],
      required: true,
    },
    minPreferredAge: { type: Number, required: true },
    maxPreferredAge: { type: Number, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profilePicture: { type: String },
  },
  { timestamps: true },
);

// ✅ Prevent OverwriteModelError
export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
