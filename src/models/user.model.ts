import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema<UserType>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    // Basic Info
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },

    // Identity
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    dateOfBirth: {
      type: Date,
    },

    culture: {
      type: String,
      enum: ["Brahmin", "Chhetri", "Newar", "Rai", "Magar", "Gurung"],
    },

    // Preferences
    interestedIn: {
      type: String,
      enum: ["Male", "Female", "Everyone"],
    },

    preferredCulture: [
      {
        type: String,
        enum: ["Brahmin", "Chhetri", "Newar", "Rai", "Magar", "Gurung"],
      },
    ],

    minPreferredAge: { type: Number },
    maxPreferredAge: { type: Number },

    // System
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);
