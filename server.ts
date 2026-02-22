import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Socket.io logic
  const rooms = new Map<string, any>();

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId, player) => {
      socket.join(roomId);
      console.log(`Player ${player.name} joined room ${roomId}`);
      // Simple room management for demo
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { players: [] });
      }
      const room = rooms.get(roomId);
      room.players.push({ ...player, socketId: socket.id });
      io.to(roomId).emit("room-update", room.players);
    });

    socket.on("game-action", (roomId, action) => {
      // Broadcast action to others in room
      socket.to(roomId).emit("game-action", action);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      // Cleanup rooms
      rooms.forEach((room, roomId) => {
        const index = room.players.findIndex((p: any) => p.socketId === socket.id);
        if (index !== -1) {
          room.players.splice(index, 1);
          io.to(roomId).emit("room-update", room.players);
        }
      });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
