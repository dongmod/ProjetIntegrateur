//server.js 
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import http from 'http';
import {Server} from "socket.io";
import Stripe from 'stripe'

// Load env 
dotenv.config()
console.log("JWT_SECRET utilisé par le serveur :", process.env.JWT_SECRET)

// Initialisation Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// Initialisation Express
const app = express();
app.use(cors({
    origin: ['http://localhost:3001', 'http://localhost:5173'], // Remplacez par l'URL de votre frontend
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT","OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(express.json())

// Routes 
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
import horairesGaragesRoutes from './routes/horaires_garages.routes.js'  ///NEW 
// dotenv.config()
// console.log("JWT_SECRET utilisé par le serveur :", process.env.JWT_SECRET)

//API Routes 
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
app.use("/api/auth", verificationmail);
app.use('/api/horaires-garage',horairesGaragesRoutes) ///NEW 

//START SERVER
const httpServer = http.createServer(app);
export const io = new Server(httpServer, {
    cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE","PUT","OPTIONS"]
    }
});

io.on("connection", (socket) => {
    console.log("Nouvelle connexion socket:", socket.id)

    socket.on("disconnect", () => {
    console.log("Socket déconnecté:", socket.id)
    })
})

// server.listen(process.env.PORT, () => {
httpServer.listen(process.env.PORT, () => {
    console.log(`Serveur lancé sur le port ${process.env.PORT}`)
    console.log("SECRET:", process.env.JWT_SECRET)

})




