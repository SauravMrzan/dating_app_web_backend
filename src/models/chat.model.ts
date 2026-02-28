import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  fromUser: mongoose.Types.ObjectId;
  toUser: mongoose.Types.ObjectId;
  message: string;
  createdAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
  },
  { timestamps: true },
);

export const ChatModel = mongoose.model<IChat>("Chat", ChatSchema);
