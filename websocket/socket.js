// socket.js
import { Server } from "socket.io";

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ['GET','POST','PUT','DELETE', 'PATCH'],
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connecté :", socket.id);

    socket.on("disconnect", () => {
      console.log("Client déconnecté :", socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO n'est pas initialisé !");
  }
  return io;
}
