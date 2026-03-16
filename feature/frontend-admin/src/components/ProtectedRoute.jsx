import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { apiFetch } from "../lib/api"; // ou ton chemin
// import { all } from "proxy-addr";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false; // ✅ DECLARÉ ICI

    const run = async () => {
      try {
        const user = await apiFetch("/api/auth/me"); // si apiFetch ajoute Authorization
        console.log ("USER PROTECTED ROUTE =", user);
        console.log ("ALLOWED ROLES PROTECTED ROUTE =", allowedRoles);
        console.log("HAS ROLE:", allowedRoles.includes(user.role));

        // Exemple : ton endpoint qui vérifie le token
        // await apiFetch("/api/auth/me"); // si apiFetch ajoute Authorization
        const hasRole = allowedRoles.length === 0 || allowedRoles.includes(user.role);
        if (!cancelled) setAllowed(hasRole);
      } catch (e) {
        if (!cancelled) setAllowed(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true; //  cleanup safe
    };
  }, [allowedRoles]); //  RE-LANCE SI LES ROLES AUTORISÉS CHANGENT

  if (loading) return <p>Chargement...</p>;
  if (!allowed) return <Navigate to="/" replace />;

  return children;
}