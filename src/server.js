import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { requireAuth } from "./lib/requireAuth.js";
import authRoutes from "./routes/auth.routes.js"; 
const app = express();
app.use(express.json());

// ✅ CORS para tu frontend Vite
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ (opcional) endpoint de prueba para ver si el JWT llega bien
app.get("/api/auth/verify", requireAuth, (req, res) => {
  res.json({ ok: true, userId: req.user.id, email: req.user.email });
});

// ✅ endpoint clave: tu frontend llama a este
app.get("/api/me", requireAuth, async (req, res) => {
  const userId = req.user.id;

  const { data: profile, error } = await supabaseAdmin
    .from("utilisateurs")
    .select("nom, prenom, role, user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  if (!profile) return res.status(404).json({ error: "Profil introuvable" });

  // ✅ Debe incluir role, si no tu frontend no puede redirigir
  return res.json(profile);
});

// ✅ (opcional) ping público
app.get("/api/health", (req, res) => res.json({ ok: true }));
console.log("mounting/api/auth route");
app.use("/api/auth", authRoutes) // Asegúrate de que authRoutes exporta un router de Express

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});