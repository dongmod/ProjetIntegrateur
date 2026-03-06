import express from 'express'
// importation du cron pour la planification des tâches de relance de maintenance
import "./utils/planificateur_de_tache.js"
import "./utils/planificationrappelavant24h.js"
import Stripe from "stripe";
import http from "http";
import "./mqtt/mqttClient.js"
import { Server } from "socket.io";
//mqtt
import mqtt from 'mqtt';
import supabase from './config/supabaseClient.js';
//import from payment routes
import paymentRoutes from "./routes/payment.routes.js";
import { confirmationpaiement } from './utils/confirmationpaiement.js';
import cors from 'cors'


import dotenv from 'dotenv'

// Chargement des variables d'environnement
dotenv.config()
console.log("JWT_SECRET utilisé par le serveur :", process.env.JWT_SECRET)
// Initialisation Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


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
    //origin: ["http://localhost:5173", "http://localhost:5174"],
 origin: "*",

  methods: ['GET','POST','PUT','DELETE', 'PATCH'],
  credentials: true
}));




//  WEBHOOK  AVANT express.json()
app.post("/api/payment/webhook",
    

  express.raw({ type: "application/json" }),
  async (req, res) => {

    const sig = req.headers["stripe-signature"]

    let event
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.log(" Signature invalide:", err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object

      const factureid = session.metadata.id
        const client_a_notifier = session.metadata.user_email
     
      await supabase
        .from("factures")
        .update({ statut: "payee" })
        .eq("id", factureid)
        console.log(" Paiement confirmé pour facture:", factureid)
    
        confirmationpaiement(client_a_notifier)

    }

    res.json({ received: true })
  }
)


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
app.use("/api/payment", paymentRoutes)
//creation mqtt
const mqttClient = mqtt.connect("mqtt://localhost:1883")

mqttClient.on("connect", () => {
  //apres connexion on verifie
  console.log("Connecté au broker MQTT")
})




// Route réception VIN
app.post("/api/vin", (req, res) => {
  const { vin } = req.body

  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/

  if (!vin || !vinRegex.test(vin)) {
    return res.status(400).json({ message: "VIN invalide" })
  }

  const payload = {
    sensor_id: "af3979a0-791e-4cfe-bcc1-67b795de8c24",
    vin: vin,
    type: "lecteur_vin",
    timestamp: new Date().toISOString()
  }

  mqttClient.publish("garage/capteurvin", JSON.stringify(payload))

  console.log("VIN envoyé via MQTT →", payload)

  res.json({ message: "VIN envoyé au système" })
})

















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