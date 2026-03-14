import { io } from "socket.io-client";

// Connexion unique partagée dans toute l'app
const socket = io("http://localhost:3001", {
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
});

socket.on("connect", () => {
  console.log("🟢 Socket connecté:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 Socket déconnecté");
});

export default socket;