import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const notificationController = new NotificationController();

router.get("/", authorizedMiddleware, (req, res) => notificationController.getNotifications(req, res));
router.put("/:id/read", authorizedMiddleware, (req, res) => notificationController.markAsRead(req, res));
router.put("/read-all", authorizedMiddleware, (req, res) => notificationController.markAllAsRead(req, res));

export default router;
