import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../lib/api"; // ou ton chemin

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false; // ✅ DECLARÉ ICI

    const run = async () => {
      try {
        // Exemple : ton endpoint qui vérifie le token
        await apiFetch("/api/auth/me"); // si apiFetch ajoute Authorization
        if (!cancelled) setAllowed(true);
      } catch (e) {
        if (!cancelled) setAllowed(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true; // ✅ cleanup safe
    };
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (!allowed) return <Navigate to="/" replace />;

  return children;
}