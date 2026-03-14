// export default DashboardEmploye;

import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import "../Dashboard.css";

const API_URL = "http://localhost:3001";

const DashboardEmploye = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    mesTachesAujourdhui: 0,
    mesRdvAujourdhui: 0,
    tachesEnCours: 0,
    tachesTerminees: 0,
  });

  const goTo = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) setMenuOpen(false);
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/", { replace: true });

      const authH = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch(`${API_URL}/api/auth/me`, { headers: authH });
      if (!res.ok) return navigate("/", { replace: true });
      const data = await res.json();
      if (data.role !== "employe") return navigate("/", { replace: true });
      setUser(data);

      try {
        const [tachesRes, rdvRes] = await Promise.all([
          fetch(`${API_URL}/api/taches`,          { headers: authH }),
          fetch(`${API_URL}/api/rendezvous/all`,   { headers: authH }),
        ]);

        const taches = tachesRes.ok ? await tachesRes.json() : [];
        const rdvs   = rdvRes.ok   ? await rdvRes.json()   : [];

        const today = new Date().toISOString().split("T")[0];

        setStats({
          mesTachesAujourdhui: taches.filter(t => t.statut !== "termine").length,
          mesRdvAujourdhui:    rdvs.filter(r => r.date_rendezvous?.slice(0, 10) === today).length,
          tachesEnCours:       taches.filter(t => t.statut === "en_cours").length,
          tachesTerminees:     taches.filter(t => t.statut === "termine").length,
        });
      } catch (e) {
        console.error("Erreur stats:", e);
      }

      setLoadingPage(false);
    };
    init();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  if (loadingPage) {
    return <p className="loading-text">Chargement...</p>;
  }

  return (
    <div className="dashboard-page">
      <Header
        onLogout={handleLogout}
        onToggleMenu={() => setMenuOpen(prev => !prev)}
      />

      <div className="dashboard-layout">
        {menuOpen && window.innerWidth <= 768 && (
          <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />
        )}

        <aside className={`sidebar ${menuOpen ? "open" : "closed"}`}>
          {menuOpen && (
            <>
              <h3 className="sidebar-title">Navigation</h3>
              <ul className="menu-list">
                <li className="menu-item" onClick={() => goTo("/dashboard-employe")}>🏠 Mon tableau de bord</li>
                <li className="menu-item" onClick={() => goTo("/taches")}>✅ Mes tâches</li>
                <li className="menu-item" onClick={() => goTo("/kanban")}>📊 Kanban</li>
                <li className="menu-item" onClick={() => goTo("/mes-rendez-vous")}>📅 Mes rendez-vous</li>
                <li className="menu-item" onClick={() => goTo("/notifications")}>🔔 Notifications</li>
                <li className="menu-item" onClick={() => goTo("/profil")}>👤 Mon profil</li>
              </ul>
            </>
          )}
        </aside>

        <main className="dashboard-main">
          <div className="page-header">
            <div>
              <h1 className="page-title">Bonjour {user?.prenom} {user?.nom}</h1>
              <p className="page-subtitle">Voici un aperçu de votre journée de travail</p>
            </div>
            <span style={{ background: "#d1fae5", color: "#065f46", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
              👷 Employé
            </span>
          </div>

          {/* Stats réelles */}
          <section className="stats-grid">
            <div className="card" style={{ cursor: "pointer" }} onClick={() => goTo("/taches")}>
              <h3 className="card-title">✅ Mes tâches actives</h3>
              <p className="card-value">{stats.mesTachesAujourdhui}</p>
              <p className="card-text">tâches à traiter</p>
            </div>
            <div className="card" style={{ cursor: "pointer" }} onClick={() => goTo("/mes-rendez-vous")}>
              <h3 className="card-title">📅 Mes RDV aujourd'hui</h3>
              <p className="card-value">{stats.mesRdvAujourdhui}</p>
              <p className="card-text">rendez-vous planifiés</p>
            </div>
            <div className="card" style={{ cursor: "pointer" }} onClick={() => goTo("/taches")}>
              <h3 className="card-title">⚙️ Tâches en cours</h3>
              <p className="card-value">{stats.tachesEnCours}</p>
              <p className="card-text">en cours d'exécution</p>
            </div>
            <div className="card" style={{ cursor: "pointer" }} onClick={() => goTo("/kanban")}>
              <h3 className="card-title">🏁 Tâches terminées</h3>
              <p className="card-value">{stats.tachesTerminees}</p>
              <p className="card-text">complétées au total</p>
            </div>
          </section>

          {/* Actions rapides */}
          <section className="section">
            <h2 className="section-title">⚡ Actions rapides</h2>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => goTo("/taches")}>✅ Voir mes tâches</button>
              <button className="action-btn" onClick={() => goTo("/kanban")}>📊 Vue Kanban</button>
              <button className="action-btn" onClick={() => goTo("/mes-rendez-vous")}>📅 Mes rendez-vous</button>
              <button className="action-btn" onClick={() => goTo("/notifications")}>🔔 Notifications</button>
            </div>
          </section>

          {/* Modules employé */}
          <section className="section">
            <h2 className="section-title">📌 Mes modules</h2>
            <div className="modules-grid">
              {[
                ["✅", "Mes tâches",       "/taches",          "Voir, démarrer et terminer vos tâches assignées avec chronomètre."],
                ["📊", "Kanban",           "/kanban",          "Vue visuelle de vos tâches par statut. Glissez pour changer le statut."],
                ["📅", "Mes rendez-vous",  "/mes-rendez-vous", "Voir vos rendez-vous assignés, confirmer votre présence."],
                ["🔔", "Notifications",   "/notifications",   "Vos alertes et rappels importants."],
                ["👤", "Mon profil",       "/profil",          "Gérer vos informations personnelles et préférences."],
              ].map(([icon, label, path, desc]) => (
                <div key={path} className="module-card" style={{ cursor: "pointer" }} onClick={() => goTo(path)}>
                  <h3>{icon} {label}</h3>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardEmploye;