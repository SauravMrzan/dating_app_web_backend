import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema<IUser>(
  {
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
    profilePicture: { type: String, required: false },
  },
  {
    timestamps: true,
  },
);

export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: Date; 
  phone: string;
  culture: 'Brahmin' | 'Chhetri' | 'Newar' | 'Rai' | 'Magar' | 'Gurung';
  interestedIn: 'Male' | 'Female' | 'Everyone';
  preferredCulture: Array<'Brahmin' | 'Chhetri' | 'Newar' | 'Rai' | 'Magar' | 'Gurung'>;
  minPreferredAge: number;
  maxPreferredAge: number;
  role: 'user' | 'admin';
  profilePicture?: string; 
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);
