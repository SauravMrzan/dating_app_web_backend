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

    // Correctly determine toUser by comparing ObjectIds as strings
    const matchFromUserId = match.fromUser.toString();
    const currentFromUserId = fromUserId.toString();

    const toUser =
      matchFromUserId === currentFromUserId ? match.toUser : match.fromUser;

    const chatDoc = await ChatModel.create({
      matchId: conversationId,
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

    // Use matchId for reliable and performant querying
    const messages = await ChatModel.find({
      matchId: conversationId,
    })
      .sort({ createdAt: 1 })
      .populate("fromUser", "fullName")
      .populate("toUser", "fullName")
      .exec();

    return messages;
  }
}
