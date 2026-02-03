import mongoose, { Schema } from "mongoose";
export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  gender: "Male" | "Female" | "Other";
  phone: string;
  culture: "Brahmin" | "Chhetri" | "Newar" | "Rai" | "Magar" | "Gurung";
  interestedIn: "Male" | "Female" | "Everyone";
  preferredCulture: Array<
    "Brahmin" | "Chhetri" | "Newar" | "Rai" | "Magar" | "Gurung"
  >;
  minPreferredAge: number;
  maxPreferredAge: number;
  role: "user" | "admin";
  profilePicture?: string;
}
const UserSchema: Schema = new Schema<IUser>(
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

export const UserModel = mongoose.model<IUser>("User", UserSchema);
