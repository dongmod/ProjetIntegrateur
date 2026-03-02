import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'
import express from 'express'
import cors from 'cors'
import rendezvousRoutes from './routes/rendezvous.routes.js'
import vehiculesRoutes from './routes/vehicules.routes.js'
import garageRoutes from './routes/garage.route.js'
import posteTravailRoutes from './routes/PosteTravail.js'
import tachesRoutes from './routes/taches.routes.js'
import statsRoutes from './routes/stats.routes.js'
import servicesRoutes from './routes/services.routes.js'
import crenauxRoutes from './routes/crenaux.routes.js'
import notificationsRoutes from './routes/notifications.route.js'
import commentaires_tachesRoutes from './routes/commentaires_taches.routes.js'
import { verifyToken} from "./middleware/authMiddleware.js";
import supabaseAdmin from './config/supabaseAdmin.js'

dotenv.config()
const app = express()


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

console.log("SECRET:", process.env.JWT_SECRET)




// SERVER DU BANCKEND POUR FRONTEND ADMIN, CONNEXION, AUTHENTIFICATION, JWT, ROLES, ETC.

// ✅ CORS pour frontend Vite
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json())

// ✅ (opcional) endpoint de prueba para ver si el JWT llega bien
app.get("/api/auth/verify", verifyToken, (req, res) => {
  res.json({ ok: true,user:req.user });
});

// ✅ endpoint important: Appel frontend pour obtenir le profil de l'utilisateur connecté, avec son role
app.get("/api/auth/me", verifyToken, async (req, res) => {
  const userId = req.user.user_id; // ← vient du token
  console.log("ME → userId =", userId);

  if (!userId) {
    return res.status(400).json({ message: "Invalid token payload" });
  }

  const { data: profile, error } = await supabaseAdmin
    .from("utilisateurs")
    .select("nom, prenom, role, user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  if (!profile) return res.status(404).json({ error: "Profil introuvable" });

  // ✅ Doit inclure le role, sinon ton frontend ne peut pas rediriger
  return res.json(profile);
});

// ✅ (opcional) ping public pour tester que le serveur fonctionne
app.get("/api/health", (req, res) => res.json({ ok: true }));
console.log("mounting/api/auth route");
app.use("/api/auth", authRoutes) // Asegúrate de que authRoutes exporta un router de Express

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});