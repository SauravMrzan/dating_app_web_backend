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

  // Extended profile fields
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
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    phone: { type: String, trim: true },
    culture: {
      type: String,
      enum: ["Brahmin", "Chhetri", "Newar", "Rai", "Magar", "Gurung"],
      required: true,
    },
    interestedIn: {
      type: String,
      enum: ["Male", "Female", "Everyone"],
      default: "Everyone",
    },
    preferredCulture: [
      {
        type: String,
        enum: ["Brahmin", "Chhetri", "Newar", "Rai", "Magar", "Gurung"],
      },
    ],
    minPreferredAge: { type: Number, default: 18 },
    maxPreferredAge: { type: Number, default: 99 },

    // Extended profile
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

// ✅ Prevent OverwriteModelError
export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
