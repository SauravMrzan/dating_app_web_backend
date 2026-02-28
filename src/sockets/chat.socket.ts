import { Server } from "socket.io";
import { MatchModel } from "../models/match.model";
import { ChatModel } from "../models/chat.model";

export function initChatSocket(io: Server) {
  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    socket.on("joinRoom", ({ roomId }) => {
      socket.join(roomId);
      console.log(`📌 User ${socket.id} joined conversation ${roomId}`);
    });

    socket.on("sendMessage", async ({ conversationId, fromUser, message }) => {
      try {
        const match = await MatchModel.findById(conversationId);
        if (!match || !match.isMutual) {
          return socket.emit("error", "You can only chat with mutual matches.");
        }

        const toUser =
          match.fromUser.toString() === fromUser
            ? match.toUser
            : match.fromUser;

        const chatDoc = await ChatModel.create({ fromUser, toUser, message });
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
