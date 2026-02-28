import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  gender: "Male" | "Female" | "Other";
  dateOfBirth: Date;
  culture: "Brahmin" | "Chhetri" | "Newar" | "Rai" | "Magar" | "Gurung";
  interestedIn: "Male" | "Female" | "Everyone";
  preferredCulture: Array<
    "Brahmin" | "Chhetri" | "Newar" | "Rai" | "Magar" | "Gurung"
  >;
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
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    dateOfBirth: { type: Date, required: true },
    culture: {
      type: String,
      enum: ["Brahmin", "Chhetri", "Newar", "Rai", "Magar", "Gurung"],
      required: true,
    },
    interestedIn: {
      type: String,
      enum: ["Male", "Female", "Everyone"],
      required: true, // ✅ enforce required so frontend must send it
    },
    preferredCulture: [
      {
        type: String,
        enum: ["Brahmin", "Chhetri", "Newar", "Rai", "Magar", "Gurung"],
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
