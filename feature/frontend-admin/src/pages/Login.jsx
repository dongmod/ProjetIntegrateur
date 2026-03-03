// ================================
// Page de connexion pour les employés et gestionnaires du garage
// - Authentification avec Supabase (email + mot de passe)
// - Vérification du rôle dans la table "utilisateurs" (gestionnaire ou employé)
// - Redirection vers le dashboard si succès, sinon affichage d'erreur
// - Fonction de réinitialisation de mot de passe via email
// - Test de connexion à l'API backend pour s'assurer que tout est configuré correctement
// ================================
// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";


//const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [email, setEmail] = useState("");
  const [mot_de_passe, setMotDePasse] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage("");
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1) Login contra tu backend
  const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          mot_de_passe }),
      });

  const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data?.message || `Erreur login (HTTP ${res.status})`);
        return;
      }
      localStorage.setItem("token", data.token); // Sauvegarde le token pour les futurs appels à l'API backend

      if (!data?.token) {
        setErrorMessage("Token manquant dans la réponse du backend.");
        return;
      }



      // ✅ Guardar token para apiFetch
      localStorage.setItem("token", data.token);

  const response2 = await fetch("http://localhost:3001/api/auth/me", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

if (!response2.ok) {
  throw new Error(`HTTP ${response2.status}`);
}

setErrorMessage("Accès réservé au personnel");

const payload = await response2.json();
const role = payload?.role || payload?.user?.role || payload?.data?.role;

console.log("ROLE:", role);

if (role === "gestionnaire") return navigate("/dashboard");


if (role === "employe") return navigate("/dashboard");
if (role === "client") return navigate("/client");

setErrorMessage("Rôle inconnu ou manquant.");
    } catch (err) {
      console.error(err);
      setErrorMessage(err?.message || "Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage("");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      alert("Entre ton email d'abord");
      return;
    }

    // Aquí depende de tu backend: tu backend tiene reset por ID (/resetMot_de_passe/:id)
    // Por ahora dejamos solo un mensaje, porque tu reset actual era de Supabase Auth.
    alert("Pour réinitialiser le mot de passe, il faut un endpoint côté backend (flow à définir).");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h1>SmartGarage Employee</h1>
        <p>Votre garage, plus intelligent chaque jour</p>

        <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
          <div style={{ marginBottom: "1rem", textAlign: "left" }}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: "100%",
                padding: "0.75rem",
                marginTop: "0.25rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem", textAlign: "left" }}>
            <label htmlFor="mot_de_passe">Mot de passe</label>
            <input
              type="password"
              id="mot_de_passe"
              placeholder="••••••••"
              value={mot_de_passe}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "0.75rem",
                marginTop: "0.25rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          {errorMessage && (
            <div
              style={{
                color: "#c62828",
                backgroundColor: "#ffebee",
                border: "1px solid #ef9a9a",
                borderRadius: "6px",
                padding: "0.75rem",
                marginBottom: "1rem",
                textAlign: "left",
                fontSize: "0.9rem",
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: loading ? "#90caf9" : "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResetPassword}
          style={{
            marginTop: "0.75rem",
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#fff",
            color: "#333",
            border: "1px solid #ccc",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          Mot de passe oublié ?
        </button>
      </div>
    </div>
  );
};

export default Login;