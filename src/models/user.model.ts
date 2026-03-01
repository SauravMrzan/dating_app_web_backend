import mongoose, { Document, Schema } from "mongoose";
import {
  CULTURES,
  GENDERS,
  INTERESTED_IN_OPTIONS,
  Culture,
  Gender,
  InterestedIn,
} from "../constants/user-options";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  gender: Gender;
  dateOfBirth: Date;
  culture: Culture;
  interestedIn: InterestedIn;
  preferredCulture: Array<Culture>;
  minPreferredAge: number;
  maxPreferredAge: number;
  role: "user" | "admin";

  // Profile fields
  bio?: string;
  interests?: string[];
  height?: number;
  zodiac?: string;
  education?: string;
  familyPlan?: string;
  photos?: string[]; // multiple photos

  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    gender: { type: String, enum: GENDERS, required: true },
    dateOfBirth: { type: Date, required: true },
    culture: {
      type: String,
      enum: CULTURES,
      required: true,
    },
    interestedIn: {
      type: String,
      enum: INTERESTED_IN_OPTIONS,
      required: true, // ✅ enforce required so frontend must send it
    },
    preferredCulture: [
      {
        type: String,
        enum: CULTURES,
      },
    ],
    minPreferredAge: { type: Number, default: 18 },
    maxPreferredAge: { type: Number, default: 99 },

    // Profile
    bio: { type: String, trim: true },
    interests: [{ type: String }],
    height: { type: Number },
    zodiac: { type: String },
    education: { type: String },
    familyPlan: { type: String },
    photos: [{ type: String }], // multiple photos

    role: { type: String, enum: ["user", "admin"], default: "user" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUser>("User", UserSchema);
