import { Request, Response } from "express";
import { ReportModel } from "../models/report.model";
import { NotificationModel } from "../models/notification.model";
import { MatchModel } from "../models/match.model";
import { UserModel } from "../models/user.model";

export class ReportController {
    // CREATE Report
    async createReport(req: Request, res: Response) {
        try {
            const reporterId = (req as any).user._id;
            const { reportedUserId, reason } = req.body;

            if (!reportedUserId || !reason) {
                return res.status(400).json({ success: false, message: "reportedUserId and reason are required" });
            }

            if (reporterId.toString() === reportedUserId.toString()) {
                return res.status(400).json({ success: false, message: "You cannot report yourself" });
            }

            const reportedUser = await UserModel.findById(reportedUserId).select("_id");
            if (!reportedUser) {
                return res.status(404).json({ success: false, message: "Reported user not found" });
            }

            const matchExists = await MatchModel.findOne({
                isMutual: true,
                $or: [
                    { fromUser: reporterId, toUser: reportedUserId },
                    { fromUser: reportedUserId, toUser: reporterId },
                ],
            }).select("_id");

            if (!matchExists) {
                return res.status(400).json({ success: false, message: "You can report only users you are matched with" });
            }

            const existingPendingReport = await ReportModel.findOne({
                reporter: reporterId,
                reportedUser: reportedUserId,
                status: "pending",
            }).select("_id");

            if (existingPendingReport) {
                return res.status(400).json({ success: false, message: "You already have a pending report for this user" });
            }

            await ReportModel.create({
                reporter: reporterId,
                reportedUser: reportedUserId,
                reason,
                status: "pending",
            });

            await NotificationModel.create({
                user: reporterId,
                type: "report_submitted",
                message: "Your report has been submitted and is awaiting admin review.",
            });

            await NotificationModel.create({
                user: reportedUserId,
                type: "report_received",
                message: "A report has been filed against your account. Our team will review it.",
            });

            return res.status(201).json({ success: true, message: "User reported successfully." });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Server Error" });
        }
    }

    // GET Reports for Admin
    async getReports(req: Request, res: Response) {
        try {
            const reports = await ReportModel.find()
                .populate("reporter", "fullName photos email _id")
                .populate("reportedUser", "fullName photos email _id")
                .sort({ createdAt: -1 });
            return res.status(200).json({ success: true, data: reports, message: "Reports fetched successfully" });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Server Error" });
        }
    }

    // RESOLVE Report & Unmatch
    async resolveReport(req: Request, res: Response) {
        try {
            const reportId = req.params.id;
            const report = await ReportModel.findById(reportId);

            if (!report) {
                return res.status(404).json({ success: false, message: "Report not found" });
            }

            if (report.status === "resolved") {
                return res.status(400).json({ success: false, message: "Report is already resolved" });
            }

            const { reporter, reportedUser } = report;

            // Unmatch the users by deleting any Match between them
            await MatchModel.deleteMany({
                $or: [
                    { fromUser: reporter, toUser: reportedUser },
                    { fromUser: reportedUser, toUser: reporter },
                ],
            });

            // Alternatively, we could update the status to "unmatched". We will just delete it to remove from Matches page.
            // Now, dispatch notifications.
            await NotificationModel.create({
                user: reporter,
                type: "report_resolved",
                message: "Your report was reviewed by admin and the users have been unmatched.",
            });

            await NotificationModel.create({
                user: reportedUser,
                type: "report_action_taken",
                message: "A report review resulted in unmatching you from the reporting user.",
            });

            report.status = "resolved";
            await report.save();

            return res.status(200).json({ success: true, message: "Report resolved and users unmatched." });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Server Error" });
        }
    }
}
