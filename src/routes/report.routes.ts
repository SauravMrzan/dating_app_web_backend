import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { isAdmin } from "../middleware/admin.middleware";

const router = Router();
const reportController = new ReportController();

// Current user creates a report
router.post("/", authorizedMiddleware, (req, res) => reportController.createReport(req, res));

// Admin fetches all reports
router.get("/admin", authorizedMiddleware, isAdmin, (req, res) => reportController.getReports(req, res));

// Admin resolves a report
router.post("/admin/:id/resolve", authorizedMiddleware, isAdmin, (req, res) => reportController.resolveReport(req, res));

export default router;
