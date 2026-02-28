import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const userController = new UserController();

// ✅ Soft delete user account
// Controller ensures proper handling of user deletion
router.delete("/delete", authorizedMiddleware, (req, res) =>
  userController.deleteAccount(req, res),
);

export default router;
