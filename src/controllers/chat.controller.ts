import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";

const chatService = new ChatService();

export class ChatController {
  /**
   * Send a new chat message
   */
  async sendMessage(req: Request, res: Response) {
    try {
      const fromUserId = (req as any).user._id;
      const { conversationId, message } = req.body;

      if (!conversationId || !message) {
        return res.status(400).json({
          success: false,
          message: "conversationId and message are required",
        });
      }

      const chat = await chatService.sendMessage(
        conversationId,
        fromUserId,
        message,
      );

      return res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: chat,
      });
    } catch (error: any) {
      console.error("SEND_MESSAGE_ERROR:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  /**
   * Get chat history for a conversation
   */
  async getMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const fromUserId = (req as any).user._id;

      const messages = await chatService.getMessages(
        conversationId,
        fromUserId,
      );

      return res.status(200).json({
        success: true,
        message: "Messages fetched successfully",
        data: messages,
      });
    } catch (error: any) {
      console.error("GET_MESSAGES_ERROR:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
