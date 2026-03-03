import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // se reutilise le meme style que pour admin 

const DashboardEmploye = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/", { replace: true });

      const res = await fetch("http://localhost:3001/api/auth/me", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return navigate("/", { replace: true });

      const data = await res.json();

      // Si no est employe se redirige al login
      if (data.role !== "employe") return navigate("/", { replace: true });

      setUser(data);
      setLoadingPage(false);
    };

    checkSession();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const goTo = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) setMenuOpen(false);
  };

  if (loadingPage) {
    return <p className="loading-text">Chargement...</p>;
  }

  return (
    <div className="dashboard-page">
      <Header
        onLogout={handleLogout}
        onToggleMenu={() => setMenuOpen((prev) => !prev)}
      />

      <div className="dashboard-layout">
        {menuOpen && window.innerWidth <= 768 && (
          <div
            className="sidebar-overlay"
            onClick={() => setMenuOpen(false)}
          />
        )}

        <aside className={`sidebar ${menuOpen ? "open" : "closed"}`}>
          {menuOpen && (
            <>
              <h3 className="sidebar-title">Navigation</h3>
              <ul className="menu-list">
                <li className="menu-item" onClick={() => goTo("/dashboard-employe")}>
                  🏠 Mon tableau de bord
                </li>
                <li className="menu-item" onClick={() => goTo("/taches")}>
                  ✅ Mes tâches
                </li>
                <li className="menu-item" onClick={() => goTo("/rendez-vous")}>
                  📅 Mes rendez-vous
                </li>
                <li className="menu-item" onClick={() => goTo("/notifications")}>
                  🔔 Notifications
                </li>
                <li className="menu-item" onClick={() => goTo("/profil")}>
                  👤 Mon profil
                </li>
              </ul>
            </>
          )}
        </aside>

        <main className="dashboard-main">
          {/* Header de bienvenida */}
          <div className="page-header">
            <div>
              <h1 className="page-title">
                Bonjour {user?.prenom} {user?.nom}
              </h1>
              <p className="page-subtitle">
                Voici un aperçu de votre journée de travail
              </p>
            </div>
            <span style={{
              background: "#d1fae5",
              color: "#065f46",
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
            }}>
              👷 Employé
            </span>
          </div>

          {/* Stats personales */}
          <section className="stats-grid">
            <div className="card">
              <h3 className="card-title">✅ Mes tâches aujourd'hui</h3>
              <p className="card-value">0</p>
              <p className="card-text">tâches assignées</p>
            </div>

            <div className="card">
              <h3 className="card-title">📅 Mes rendez-vous</h3>
              <p className="card-value">0</p>
              <p className="card-text">à venir aujourd'hui</p>
            </div>

            <div className="card">
              <h3 className="card-title">🔔 Notifications</h3>
              <p className="card-value">0</p>
              <p className="card-text">non lues</p>
            </div>

            <div className="card">
              <h3 className="card-title">📊 Tâches complétées</h3>
              <p className="card-value">0</p>
              <p className="card-text">cette semaine</p>
            </div>
          </section>

          {/* Actions rapides */}
          <section className="section">
            <h2 className="section-title">⚡ Actions rapides</h2>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => goTo("/taches")}>
                Voir mes tâches
              </button>
              <button className="action-btn" onClick={() => goTo("/rendez-vous")}>
                Voir mes rendez-vous
              </button>
              <button className="action-btn" onClick={() => goTo("/notifications")}>
                Mes notifications
              </button>
              <button className="action-btn" onClick={() => goTo("/profil")}>
                Mon profil
              </button>
            </div>
          </section>

          {/* Estadísticas generales (solo lectura) */}
          <section className="section">
            <h2 className="section-title">📊 Statistiques générales</h2>
            <div className="modules-grid">
              <div className="module-card">
                <h3>🚗 Véhicules en service</h3>
                <p style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: "8px 0" }}>0</p>
                <p>véhicules actuellement en atelier</p>
              </div>

              <div className="module-card">
                <h3>✅ Tâches du garage</h3>
                <p style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: "8px 0" }}>0</p>
                <p>tâches en cours au total</p>
              </div>

              <div className="module-card">
                <h3>📅 Rendez-vous du jour</h3>
                <p style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: "8px 0" }}>0</p>
                <p>rendez-vous planifiés aujourd'hui</p>
              </div>
            </div>
          </section>

          {/* Actividad reciente */}
          <section className="section">
            <h2 className="section-title">🕒 Activité récente</h2>
            <div className="table-container">
              <table className="activity-table">
                <thead>
                  <tr>
                    <th>Heure</th>
                    <th>Événement</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3} style={{ textAlign: "center", color: "#9ca3af", padding: 20 }}>
                      Aucune activité récente
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardEmploye;