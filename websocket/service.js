
import { getIO } from "./socket.js";


//  Service pour émettre des événements liés aux rendez-vous
export function emitRdvCreate(rdvId, data) {
  const io = getIO();

  io.emit("rdv:create", {
    type: "created",
    id: rdvId,
    data
  });
}
export function emitRdvUpdate(rdvId, data) {
  const io = getIO();

  io.emit("rdv:update", {
    type: "updated",
    id: rdvId,
    data
  });
}
export function emitRdvDelete(rdvId, data) {
  const io = getIO();
 console.log(" Émission rdv:delete :", rdvId, data);
  io.emit("rdv:delete", {
    type: "deleted",
    id: rdvId,
    data
  });
}

// Service pour émettre des événements liés aux avis
