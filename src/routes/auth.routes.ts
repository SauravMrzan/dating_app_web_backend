import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { uploads } from "../middleware/upload.middleware";

const router = Router();
const authController = new AuthController();

// Public Routes
// Public Routes
router.post("/register", uploads.array("photos", 3), (req, res) =>
  authController.register(req, res),
);
router.post("/login", (req, res) => authController.login(req, res));
router.get("/options", (req, res) => authController.getAuthOptions(req, res));

// Protected Routes
router.get("/whoami", authorizedMiddleware, (req, res) =>
  authController.getUserProfile(req, res),
);

// ✅ Update Profile Route (supports up to 3 photos)
// Ensures interestedIn is validated in controller
router.put(
  "/update-profile",
  authorizedMiddleware,
  uploads.array("photos", 3),
  (req, res) => authController.updateUserProfile(req, res),
);

export default router;
