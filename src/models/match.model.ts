import mongoose, { Document, Schema } from "mongoose";

export interface IMatch extends Document {
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  status: 'like' | 'dislike';
  isMutual: boolean; // True if both users liked each other
}

const MatchSchema: Schema = new Schema(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["like", "dislike"], required: true },
    isMutual: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent duplicate swipes on the same person
MatchSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

export const MatchModel = mongoose.model<IMatch>("Match", MatchSchema);