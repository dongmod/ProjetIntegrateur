import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data?.session) {
        navigate("/", { replace: true });
        return;
      }

      setLoadingPage(false);
    };

    checkSession();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Erreur lors de la déconnexion");
      return;
    }

    navigate("/", { replace: true });
  };

  if (loadingPage) {
    return <p style={{ padding: "1rem" }}>Chargement du dashboard...</p>;
  }

  return (
    <div>
      <Header title="Dashboard" subtitle="Bienvenue" onLogout={handleLogout} />
      <main style={{ padding: "1rem" }}>
        <p>Contenido del dashboard</p>
      </main>
    </div>
  );
};

export default Dashboard;