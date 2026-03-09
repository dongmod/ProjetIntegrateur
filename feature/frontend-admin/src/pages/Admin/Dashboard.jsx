// import React, { useEffect, useState } from "react";
// import Header from "../../components/Header";
// import { useNavigate } from "react-router-dom";
// import "../Dashboard.css";

// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [loadingPage, setLoadingPage] = useState(true);
//   const [menuOpen, setMenuOpen] = useState(true);
//   const [userRole, setUserRole] = useState(null);
  

//   const goTo = (path) => {
//   navigate(path);
//   if (window.innerWidth <= 768) {
//     setMenuOpen(false);
//   }
// };


//   useEffect(() => {
//     const checkSession = async () => {
//       //const { data, error } = await supabase.auth.getSession();
//     const token = localStorage.getItem("token");
//     if (!token) return navigate("/", { replace: true });

//     const res = await fetch("http://localhost:3001/api/auth/me", {
//     headers: {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`
// }


// });

// if (!res.ok) return navigate("/", { replace: true });

// const data=await res.json();
// setUserRole(data.role);    //<==== Garde le rôle de l'utilisateur pour afficher/masquer des éléments du dashboard selon les permissions
// setLoadingPage(false);

//     };
// checkSession();
//   }, [navigate]);

// const handleLogout = () => {
//   localStorage.removeItem("token");
//   navigate("/", { replace: true });
// };



//  if (loadingPage) {
//     return <p className="loading-text">Chargement du dashboard...</p>;
//   }

//   return (
//     <div className="dashboard-page">
//       <Header
//         onLogout={handleLogout}
//         onToggleMenu={() => setMenuOpen((prev) => !prev)}
//       />

//       <div className="dashboard-layout">
//         {menuOpen && window.innerWidth <=768 && (
//           <div 
//           className="sidebar-overlay" 
//           onClick={() => setMenuOpen(false)}></div>
//         )}
        
//         <aside className={`sidebar ${menuOpen ? "open" : "closed"}`}>
//           {menuOpen && (
//             <>
//               <h3 className="sidebar-title">Navigation</h3>
//               <ul className="menu-list">
//                 <li className="menu-item" onClick={() => navigate("/dashboard")}>
//                   🏠 Tableau de bord
//                 </li>
//                 <li className="menu-item" onClick={() => navigate("/calendrier-rdv")}>
//                   📅 Rendez-vous
//                 </li>
//                 <li className="menu-item" onClick={() => navigate("/creneaux")}>
//                   ✅ Gestion des creneaux
//                 </li>
//                 <li className="menu-item" onClick={() => navigate("/utilisateurs")}>
//                   👥 Utilisateurs
//                 </li>
//                 <li className="menu-item" onClick={() => navigate("/services")}>
//                   🛠️ Services
//                 </li>
//                 <li className="menu-item" onClick={() => navigate("/vehicules")}>
//                   🚗 Véhicules
//                 </li>
//                 <li
//                   className="menu-item"
//                   onClick={() => navigate("/notifications")}
//                 >
//                   🔔 Notifications
//                 </li>
//                 <li className="menu-item" onClick={() => navigate("/parametres")}>
//                   ⚙️ Paramètres
//                 </li>
//               </ul>
//             </>
//           )}
//         </aside>

//         <main className="dashboard-main">
//           <div className="page-header">
//             <h1 className="page-title">Bonjour Admin</h1>
//             <p className="page-subtitle">
//               Bienvenue dans votre espace d’administration SmartGarage
//             </p>
//           </div>

//           <section className="stats-grid">
//             <div className="card">
//               <h3 className="card-title">📅 Rendez-vous aujourd’hui</h3>
//               <p className="card-value">0</p>
//               <p className="card-text"> en attente de confirmation</p>
//             </div>

//             <div className="card">
//               <h3 className="card-title">✅ Tâches en cours</h3>
//               <p className="card-value">0</p>
//               <p className="card-text">2 tâches prioritaires</p>
//             </div>

//             <div className="card">
//               <h3 className="card-title">👥 Employés connectés</h3>
//               <p className="card-value">0</p>
//               <p className="card-text">Sur 0 employés</p>
//             </div>

//             <div className="card">
//               <h3 className="card-title">💰 Revenus (semaine)</h3>
//               <p className="card-value">0 $</p>
//               <p className="card-text">+0% vs semaine passée</p>
//             </div>
//           </section>

//           <section className="section">
//             <h2 className="section-title">⚡ Actions rapides</h2>
//             <div className="actions-grid">
//               <button
//                 className="action-btn"
//                 onClick={() => navigate("/calendrier-rdv")}
//               >
//                 Nouveau rendez-vous
//               </button>
//               <button className="action-btn" onClick={() => navigate("/taches")}>
//                 Créer une tâche
//               </button>
//               <button
//                 className="action-btn"
//                 onClick={() => navigate("/utilisateurs")}
//               >
//                 Gérer utilisateurs
//               </button>
//               <button
//                 className="action-btn"
//                 onClick={() => navigate("/services")}
//               >
//                 Modifier services
//               </button>
//             </div>
//           </section>

//           <section className="section">
//             <h2 className="section-title">📌 Modules administrateur</h2>
//             <div className="modules-grid">
//               <div className="module-card">
//                 <h3>📅 Rendez-vous</h3>
//                 <p>Planifier, confirmer, annuler et assigner les rendez-vous.</p>
//               </div>

//               <div className="module-card">
//                 <h3>✅ Gestion des tâches</h3>
//                 <p>Créer, assigner et suivre les tâches par priorité et statut.</p>
//               </div>

//               <div className="module-card">
//                 <h3>👥 Utilisateurs</h3>
//                 <p>Gérer les comptes, rôles et permissions des employés.</p>
//               </div>

//               <div className="module-card">
//                 <h3>🛠️ Services</h3>
//                 <p>Modifier les services, tarifs et durées disponibles.</p>
//               </div>

//               <div className="module-card">
//                 <h3>🔔 Notifications</h3>
//                 <p>Envoyer des rappels et alertes aux clients et employés.</p>
//               </div>

//               <div className="module-card">
//                 <h3>📊 Statistiques</h3>
//                 <p>Voir les revenus, performances et tendances du garage.</p>
//               </div>
//             </div>
//           </section>

//           <section className="section">
//             <h2 className="section-title">🕒 Activité récente</h2>
//             <div className="table-container">
//               <table className="activity-table">
//                 <thead>
//                   <tr>
//                     <th>Heure</th>
//                     <th>Événement</th>
//                     <th>Statut</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td>08:30</td>
//                     <td>Rendez-vous confirmé - Client #124</td>
//                     <td>✅ Confirmé</td>
//                   </tr>
//                   <tr>
//                     <td>09:10</td>
//                     <td>Tâche assignée à Ahmed</td>
//                     <td>🟡 En cours</td>
//                   </tr>
//                   <tr>
//                     <td>10:05</td>
//                     <td>Service “Lavage Premium” mis à jour</td>
//                     <td>ℹ️ Info</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import "../Dashboard.css";

const API_URL = "http://localhost:3001";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loadingPage, setLoadingPage] = useState(true);
  const [menuOpen, setMenuOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    rdvAujourdhui: 0,
    tachesEnCours: 0,
    employes: 0,
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
      setUser(data);

      try {
        const [tachesRes, rdvRes, empRes] = await Promise.all([
          fetch(`${API_URL}/api/taches/all`,     { headers: authH }),
          fetch(`${API_URL}/api/rendezvous/all`,  { headers: authH }),
          fetch(`${API_URL}/api/auth/getUser`,    { headers: authH }),
        ]);

        const taches   = tachesRes.ok  ? await tachesRes.json()  : [];
        const rdvs     = rdvRes.ok     ? await rdvRes.json()     : [];
        const employes = empRes.ok     ? await empRes.json()     : [];

        const today = new Date().toISOString().split("T")[0];

        setStats({
          rdvAujourdhui:   rdvs.filter(r => r.date_rendezvous?.slice(0, 10) === today).length,
          tachesEnCours:   taches.filter(t => t.statut === "en_cours").length,
          employes:        employes.filter(e => e.role === "employe").length,
          tachesTerminees: taches.filter(t => t.statut === "termine").length,
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
    return <p className="loading-text">Chargement du dashboard...</p>;
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
                <li className="menu-item" onClick={() => goTo("/dashboard")}>🏠 Tableau de bord</li>
                <li className="menu-item" onClick={() => goTo("/rendez-vous")}>📅 Rendez-vous</li>
                <li className="menu-item" onClick={() => goTo("/crenaux")}>🕐 Créneaux</li>
                <li className="menu-item" onClick={() => goTo("/gestion-taches")}>✅ Tâches</li>
                <li className="menu-item" onClick={() => goTo("/kanban")}>📊 Kanban</li>
                <li className="menu-item" onClick={() => goTo("/utilisateurs")}>👥 Utilisateurs</li>
                <li className="menu-item" onClick={() => goTo("/services")}>🛠️ Services</li>
                <li className="menu-item" onClick={() => goTo("/vehicules")}>🚗 Véhicules</li>
                <li className="menu-item" onClick={() => goTo("/notifications")}>🔔 Notifications</li>
                <li className="menu-item" onClick={() => goTo("/parametres")}>⚙️ Paramètres</li>
              </ul>
            </>
          )}
        </aside>

        <main className="dashboard-main">
          <div className="page-header">
            <div>
              <h1 className="page-title">Bonjour {user?.prenom} {user?.nom}</h1>
              <p className="page-subtitle">Bienvenue dans votre espace d'administration SmartGarage</p>
            </div>
            <span style={{ background: "#dbeafe", color: "#1e40af", padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
              🛠️ Gestionnaire
            </span>
          </div>

          {/* Stats réelles */}
          <section className="stats-grid">
            <div className="card" style={{ cursor: "pointer" }} onClick={() => goTo("/rendez-vous")}>
              <h3 className="card-title">📅 Rendez-vous aujourd'hui</h3>
              <p className="card-value">{stats.rdvAujourdhui}</p>
              <p className="card-text">planifiés aujourd'hui</p>
            </div>
            <div className="card" style={{ cursor: "pointer" }} onClick={() => goTo("/gestion-taches")}>
              <h3 className="card-title">⚙️ Tâches en cours</h3>
              <p className="card-value">{stats.tachesEnCours}</p>
              <p className="card-text">en cours d'exécution</p>
            </div>
            <div className="card" style={{ cursor: "pointer" }} onClick={() => goTo("/utilisateurs")}>
              <h3 className="card-title">👥 Employés</h3>
              <p className="card-value">{stats.employes}</p>
              <p className="card-text">dans votre équipe</p>
            </div>
            <div className="card" style={{ cursor: "pointer" }} onClick={() => goTo("/kanban")}>
              <h3 className="card-title">✅ Tâches terminées</h3>
              <p className="card-value">{stats.tachesTerminees}</p>
              <p className="card-text">complétées au total</p>
            </div>
          </section>

          {/* Actions rapides */}
          <section className="section">
            <h2 className="section-title">⚡ Actions rapides</h2>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => goTo("/rendez-vous")}>📅 Nouveau rendez-vous</button>
              <button className="action-btn" onClick={() => goTo("/gestion-taches")}>✅ Créer une tâche</button>
              <button className="action-btn" onClick={() => goTo("/utilisateurs")}>👥 Gérer utilisateurs</button>
              <button className="action-btn" onClick={() => goTo("/crenaux")}>🕐 Gérer créneaux</button>
              <button className="action-btn" onClick={() => goTo("/kanban")}>📊 Vue Kanban</button>
              <button className="action-btn" onClick={() => goTo("/services")}>🛠️ Modifier services</button>
            </div>
          </section>

          {/* Modules */}
          <section className="section">
            <h2 className="section-title">📌 Modules administrateur</h2>
            <div className="modules-grid">
              {[
                ["📅", "Rendez-vous",      "/rendez-vous",     "Planifier, confirmer et assigner les rendez-vous avec drag & drop."],
                ["✅", "Gestion tâches",   "/gestion-taches",  "Créer, assigner et suivre les tâches par priorité et statut."],
                ["📊", "Vue Kanban",       "/kanban",          "Visualisez et déplacez les tâches entre colonnes."],
                ["🕐", "Créneaux",         "/crenaux",         "Configurez les horaires du garage et simulez la disponibilité."],
                ["👥", "Utilisateurs",     "/utilisateurs",    "Gérer les comptes, rôles et permissions des employés."],
                ["🛠️", "Services",         "/services",        "Modifier les services, tarifs et durées disponibles."],
                ["🔔", "Notifications",    "/notifications",   "Envoyer des rappels et alertes aux clients et employés."],
                ["🚗", "Véhicules",        "/vehicules",       "Consulter les véhicules enregistrés et leur historique."],
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

export default Dashboard;