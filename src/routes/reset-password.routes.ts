import { Router } from "express";
import { ResetPasswordController } from "../controllers/reset-password.controller";

const router = Router();
const resetPasswordController = new ResetPasswordController();

router.post("/:token", (req, res) =>
  resetPasswordController.resetPassword(req, res),
);

export default router;
