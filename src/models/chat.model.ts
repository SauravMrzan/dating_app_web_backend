import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  matchId: mongoose.Types.ObjectId;
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true },
);

// Optimize queries by matchId
ChatSchema.index({ matchId: 1, createdAt: 1 });

export const ChatModel = mongoose.model<IChat>("Chat", ChatSchema);
