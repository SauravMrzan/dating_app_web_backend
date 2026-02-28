import express from "express";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { ChatController } from "../controllers/chat.controller";

const router = express.Router();
const chatController = new ChatController();

/**
 * ✅ Send a new message
 * Requires body: { conversationId, message }
 */
router.post(
  "/send",
  authorizedMiddleware,
  chatController.sendMessage,
);

/**
 * ✅ Get messages for a conversation
 * Uses params: conversationId
 */
router.get(
  "/:conversationId",
  authorizedMiddleware,
  chatController.getMessages,
);

export default router;
