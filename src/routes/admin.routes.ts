import { Router } from "express";
import { isAdmin, protect } from "../middleware/admin.middleware";
import { AdminController } from "../controllers/admin.controller";
import { upload } from "../middleware/upload.middleware";

const router = Router();
const adminController = new AdminController();

// 1. GET /api/admin/users -> List all users
router.get("/users", protect, isAdmin, (req, res) =>
  adminController.getAllUsers(req, res),
);

// 2. POST /api/admin/users -> Create user with Image (Uses Multer)
// ✅ Controller enforces interestedIn validation
router.post(
  "/users",
  protect,
  isAdmin,
  upload.single("profilePicture"),
  (req, res) => adminController.createUser(req, res),
);

// 3. GET /api/admin/users/:id -> Get specific user details
router.get("/users/:id", protect, isAdmin, (req, res) =>
  adminController.getUserById(req, res),
);

// 4. PUT /api/admin/users/:id -> Update user with optional Image
// ✅ Controller enforces interestedIn validation
router.put(
  "/users/:id",
  protect,
  isAdmin,
  upload.single("profilePicture"),
  (req, res) => adminController.updateUser(req, res),
);

// 5. DELETE /api/admin/users/:id -> Remove a user
router.delete("/users/:id", protect, isAdmin, (req, res) =>
  adminController.deleteUser(req, res),
);

// Dashboard stats for the frontend table/cards
// ✅ Controller includes interestedIn in recentActivity
router.get("/dashboard-stats", protect, isAdmin, (req, res) =>
  adminController.getDashboardStats(req, res),
);

export default router;
