import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { upload } from "../middleware/upload.middleware";

const router = Router();
const authController = new AuthController();

// 1. Public Routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// 2. Protected Routes (Require Login)
router.get("/whoami", authorizedMiddleware, authController.getUserProfile);

// 3. Update Profile Route
// Logic: First check if user is logged in, then handle the 'profilePicture' file, then run controller
router.put(
  "/update-profile",
  authorizedMiddleware,
  upload.single("profilePicture"),
  authController.updateUserProfile,
);

export default router;
