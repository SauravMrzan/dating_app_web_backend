import { Request, Response } from "express";
import { NotificationModel } from "../models/notification.model";

export class NotificationController {
    // GET notifications for current user
    async getNotifications(req: Request, res: Response) {
        try {
            const userId = (req as any).user._id;
            const notifications = await NotificationModel.find({ user: userId })
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                message: notifications.length === 0 ? "No notifications" : "Notifications fetched",
                data: notifications,
            });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Server Error" });
        }
    }

    // MARK Notification as Read
    async markAsRead(req: Request, res: Response) {
        try {
            const userId = (req as any).user._id;
            const notificationId = req.params.id;
            const notification = await NotificationModel.findOne({ _id: notificationId, user: userId });

            if (!notification) {
                return res.status(404).json({ success: false, message: "Notification not found" });
            }

            notification.isRead = true;
            await notification.save();

            return res.status(200).json({ success: true, message: "Notification marked as read" });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Server Error" });
        }
    }

    // MARK All as Read
    async markAllAsRead(req: Request, res: Response) {
        try {
            const userId = (req as any).user._id;
            await NotificationModel.updateMany({ user: userId }, { isRead: true });

            return res.status(200).json({ success: true, message: "All notifications marked as read" });
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message || "Server Error" });
        }
    }
}
