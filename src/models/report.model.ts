import mongoose, { Document, Schema } from "mongoose";

export interface IReport extends Document {
    reporter: mongoose.Types.ObjectId;
    reportedUser: mongoose.Types.ObjectId;
    reason: string;
    status: "pending" | "resolved";
    createdAt?: Date;
    updatedAt?: Date;
}

const ReportSchema: Schema = new Schema(
    {
        reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
        reportedUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
        reason: { type: String, required: true },
        status: { type: String, enum: ["pending", "resolved"], default: "pending" },
    },
    { timestamps: true }
);

export const ReportModel = mongoose.model<IReport>("Report", ReportSchema);
