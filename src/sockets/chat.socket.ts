import { Server } from "socket.io";
import { MatchModel } from "../models/match.model";
import { ChatModel } from "../models/chat.model";

let ioInstance: Server;

export function initChatSocket(io: Server) {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("joinRoom", ({ roomId }: { roomId: string }) => {
      socket.join(roomId);
      console.log(`📌 User ${socket.id} joined conversation ${roomId}`);
    });

    socket.on(
      "sendMessage",
      async ({
        conversationId,
        fromUser,
        message,
      }: {
        conversationId: string;
        fromUser: string;
        message: string;
      }) => {
        try {
          const match = await MatchModel.findById(conversationId);
          if (!match || !match.isMutual) {
            return socket.emit("error", "You can only chat with mutual matches.");
          }

          // Fix: Use .toString() for reliable ID comparison
          const matchFromUserId = match.fromUser.toString();
          const currentFromUserId = fromUser.toString();

          const toUser =
            matchFromUserId === currentFromUserId
              ? match.toUser
              : match.fromUser;

          const chatDoc = await ChatModel.create({
            matchId: conversationId, // Fix: Include matchId
            fromUser,
            toUser,
            message,
          });

          const populatedChat = await ChatModel.findById(chatDoc._id)
            .populate("fromUser", "fullName")
            .populate("toUser", "fullName")
            .exec();

          // ✅ Emit to the shared conversation room
          io.to(conversationId).emit("newMessage", populatedChat);
        } catch (err) {
          console.error("❌ Socket sendMessage error:", err);
          socket.emit("error", "Internal server error while sending message.");
        }
      });
  });
}

/**
 * Access the Socket.IO instance from anywhere in the app
 */
export const getIO = () => ioInstance;
