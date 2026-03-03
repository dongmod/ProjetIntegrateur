import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);
  const [menuOpen, setMenuOpen] = useState(true);

  const goTo = (path) => {
  navigate(path);
  if (window.innerWidth <= 768) {
    setMenuOpen(false);
  }
};


  useEffect(() => {
    const checkSession = async () => {
      //const { data, error } = await supabase.auth.getSession();
const token = localStorage.getItem("token");
if (!token) return navigate("/", { replace: true });

const res = await fetch("http://localhost:3001/api/auth/me", {
  headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`
}


});

if (!res.ok) return navigate("/", { replace: true });

setLoadingPage(false);

    };
checkSession();
  }, [navigate]);

const handleLogout = () => {
  localStorage.removeItem("token");
  navigate("/", { replace: true });
};



 if (loadingPage) {
    return <p className="loading-text">Chargement du dashboard...</p>;
  }

  return (
    <div className="dashboard-page">
      <Header
        onLogout={handleLogout}
        onToggleMenu={() => setMenuOpen((prev) => !prev)}
      />

      <div className="dashboard-layout">
        <aside className={`sidebar ${menuOpen ? "open" : "closed"}`}>
          {menuOpen && (
            <>
              <h3 className="sidebar-title">Navigation</h3>
              <ul className="menu-list">
                <li className="menu-item" onClick={() => navigate("/dashboard")}>
                  🏠 Tableau de bord
                </li>
                <li className="menu-item" onClick={() => navigate("/rendez-vous")}>
                  📅 Rendez-vous
                </li>
                <li className="menu-item" onClick={() => navigate("/taches")}>
                  ✅ Gestion des tâches
                </li>
                <li className="menu-item" onClick={() => navigate("/utilisateurs")}>
                  👥 Utilisateurs
                </li>
                <li className="menu-item" onClick={() => navigate("/services")}>
                  🛠️ Services
                </li>
                <li className="menu-item" onClick={() => navigate("/vehicules")}>
                  🚗 Véhicules
                </li>
                <li
                  className="menu-item"
                  onClick={() => navigate("/notifications")}
                >
                  🔔 Notifications
                </li>
                <li className="menu-item" onClick={() => navigate("/parametres")}>
                  ⚙️ Paramètres
                </li>
              </ul>
            </>
          )}
        </aside>

        <main className="dashboard-main">
          <div className="page-header">
            <h1 className="page-title">Dashboard Admin</h1>
            <p className="page-subtitle">
              Bienvenue dans votre espace d’administration SmartGarage
            </p>
          </div>

          <section className="stats-grid">
            <div className="card">
              <h3 className="card-title">📅 Rendez-vous aujourd’hui</h3>
              <p className="card-value">0</p>
              <p className="card-text"> en attente de confirmation</p>
            </div>

            <div className="card">
              <h3 className="card-title">✅ Tâches en cours</h3>
              <p className="card-value">0</p>
              <p className="card-text">2 tâches prioritaires</p>
            </div>

            <div className="card">
              <h3 className="card-title">👥 Employés connectés</h3>
              <p className="card-value">0</p>
              <p className="card-text">Sur 0 employés</p>
            </div>

            <div className="card">
              <h3 className="card-title">💰 Revenus (semaine)</h3>
              <p className="card-value">0 $</p>
              <p className="card-text">+0% vs semaine passée</p>
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">⚡ Actions rapides</h2>
            <div className="actions-grid">
              <button
                className="action-btn"
                onClick={() => goTo("/rendez-vous")}
              >
                Nouveau rendez-vous
              </button>
              <button className="action-btn" onClick={() => navigate("/taches")}>
                Créer une tâche
              </button>
              <button
                className="action-btn"
                onClick={() => navigate("/utilisateurs")}
              >
                Gérer utilisateurs
              </button>
              <button
                className="action-btn"
                onClick={() => navigate("/services")}
              >
                Modifier services
              </button>
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">📌 Modules administrateur</h2>
            <div className="modules-grid">
              <div className="module-card">
                <h3>📅 Rendez-vous</h3>
                <p>Planifier, confirmer, annuler et assigner les rendez-vous.</p>
              </div>

              <div className="module-card">
                <h3>✅ Gestion des tâches</h3>
                <p>Créer, assigner et suivre les tâches par priorité et statut.</p>
              </div>

              <div className="module-card">
                <h3>👥 Utilisateurs</h3>
                <p>Gérer les comptes, rôles et permissions des employés.</p>
              </div>

              <div className="module-card">
                <h3>🛠️ Services</h3>
                <p>Modifier les services, tarifs et durées disponibles.</p>
              </div>

              <div className="module-card">
                <h3>🔔 Notifications</h3>
                <p>Envoyer des rappels et alertes aux clients et employés.</p>
              </div>

              <div className="module-card">
                <h3>📊 Statistiques</h3>
                <p>Voir les revenus, performances et tendances du garage.</p>
              </div>
            </div>
          </section>

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
                    <td>08:30</td>
                    <td>Rendez-vous confirmé - Client #124</td>
                    <td>✅ Confirmé</td>
                  </tr>
                  <tr>
                    <td>09:10</td>
                    <td>Tâche assignée à Ahmed</td>
                    <td>🟡 En cours</td>
                  </tr>
                  <tr>
                    <td>10:05</td>
                    <td>Service “Lavage Premium” mis à jour</td>
                    <td>ℹ️ Info</td>
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

export default Dashboard;