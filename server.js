import "./mqtt/mqttClient.js"
import express from 'express'

import cors from 'cors'
import http from "http";

import dotenv from 'dotenv'
import { Server } from "socket.io";
// Chargement des variables d'environnement
dotenv.config()
console.log("JWT_SECRET utilisé par le serveur :", process.env.JWT_SECRET)

// Initialisation Express
const app = express();


import authRoutes from './routes/auth.routes.js'
import rendezvousRoutes from './routes/rendezvous.routes.js'
import vehiculesRoutes from './routes/vehicules.routes.js'
import garageRoutes from './routes/garage.route.js'
import posteTravailRoutes from './routes/PosteTravail.js'
import tachesRoutes from './routes/taches.routes.js'
import statsRoutes from './routes/stats.routes.js'
import servicesRoutes from './routes/services.routes.js'
import crenauxRoutes from './routes/crenaux.routes.js'
import factureRoutes from './routes/facture.routes.js'
import capteursRoutes from './routes/capteurs.routes.js'
import genererfactureRoutes from './routes/genererfacture.routes.js'
import notificationsRoutes from './routes/notifications.route.js'
import verificationmail from "./routes/confirmationmail.route.js";
import commentaires_tachesRoutes from './routes/commentaires_taches.routes.js'


app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET','POST','PUT','DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json())
// les routes
app.use('/api/auth', authRoutes)
app.use('/api/rendezvous', rendezvousRoutes)
app.use('/api/garages', garageRoutes)
app.use('/api/vehicules', vehiculesRoutes)
app.use('/api/posteTravail', posteTravailRoutes)
app.use('/api/taches', tachesRoutes)
app.use('/api/services', servicesRoutes)
app.use('/api/commentaires_taches',commentaires_tachesRoutes)
app.use('/api/notifications',notificationsRoutes)
app.use('/api/stats',statsRoutes)
app.use('/api/crenaux',crenauxRoutes)
app.use("/api/factures", factureRoutes)
app.use("/api/capteurs", capteursRoutes)
app.use("/api/genererfacture", genererfactureRoutes);
app.use("/api/auth", verificationmail);



// Création du serveur HTTP
const server = http.createServer(app);
// Initialisation Socket.IO

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3001',

 }
});
io.on("connection", (socket) => {
  console.log("Client connecté :", socket.id);
    socket.on("disconnect", () => {
    console.log("Client déconnecté :", socket.id);
  });

});
// Démarrage du serveur HTTP + WebSocket


server.listen(process.env.PORT, () => {
console.log(`Serveur lancé sur le port ${process.env.PORT}`);
console.log("SECRET:", process.env.JWT_SECRET)

});
export { io };