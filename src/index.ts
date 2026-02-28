// index.ts
import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { PORT, FRONTEND_URL } from "./config"; // ✅ import FRONTEND_URL from config/index.ts
import { connectDatabase } from "./database/mongodb";
import { initChatSocket } from "./sockets/chat.socket";

connectDatabase();

// ✅ Create HTTP server from Express app
const server = http.createServer(app);

// ✅ Attach Socket.IO to the HTTP server
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL, // comes from .env FRONTEND_URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Initialize chat socket handlers
initChatSocket(io);

// ✅ Start server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://192.168.0.102:${PORT}`);
  console.log(`Network: ${PORT} (Use this for Mobile/Flutter)`);
});
