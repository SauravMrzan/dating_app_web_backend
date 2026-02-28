import { ChatModel } from "../models/chat.model";
import { MatchModel } from "../models/match.model";
import { HttpError } from "../errors/http-error";

export class ChatService {
  /**
   * Send a message in a conversation
   */
  async sendMessage(
    conversationId: string,
    fromUserId: string,
    message: string,
  ) {
    const match = await MatchModel.findById(conversationId);

    if (!match || !match.isMutual) {
      throw new HttpError(403, "You can only chat with mutual matches.");
    }

    const toUser =
      match.fromUser.toString() === fromUserId ? match.toUser : match.fromUser;

    const chatDoc = await ChatModel.create({
      fromUser: fromUserId,
      toUser,
      message,
    });

    const populatedChat = await ChatModel.findById(chatDoc._id)
      .populate("fromUser", "fullName")
      .populate("toUser", "fullName")
      .exec();

    return populatedChat;
  }

  /**
   * Get all messages in a conversation
   */
  async getMessages(conversationId: string, fromUserId: string) {
    const match = await MatchModel.findById(conversationId);

    if (!match || !match.isMutual) {
      throw new HttpError(403, "You can only view chats with mutual matches.");
    }

    const messages = await ChatModel.find({
      $or: [
        { fromUser: match.fromUser, toUser: match.toUser },
        { fromUser: match.toUser, toUser: match.fromUser },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("fromUser", "fullName")
      .populate("toUser", "fullName")
      .exec();

    return messages;
  }
}
