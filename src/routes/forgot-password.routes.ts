import { Router } from "express";
import { ForgotPasswordController } from "../controllers/forgot-password.controller";

const router = Router();
const forgotPasswordController = new ForgotPasswordController();

router.post("/", (req, res) =>
  forgotPasswordController.forgotPassword(req, res),
);

export default router;
