import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    type: string;
    message: string;
    isRead: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const NotificationSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, required: true }, // e.g., 'report_resolved', 'reported_warning'
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);
