// import React, { useEffect, useState, useRef } from "react";
// import Header from "../components/Header";
// import { useNavigate } from "react-router-dom";

// const API_URL = "http://localhost:3001";

// const COLONNES = [
//   { id: "attribue", label: "Attribué",  emoji: "📋", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
//   { id: "en_cours", label: "En cours",  emoji: "⚙️",  color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d" },
//   { id: "termine",  label: "Terminé",   emoji: "✅",  color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
// ];

// const URGENCE = {
//   haute:   { label: "Haute",   dot: "#ef4444", bg: "#fee2e2", color: "#991b1b" },
//   moyenne: { label: "Moyenne", dot: "#f59e0b", bg: "#fef3c7", color: "#92400e" },
//   basse:   { label: "Basse",   dot: "#10b981", bg: "#d1fae5", color: "#065f46" },
// };

// function TacheKanbanCard({ tache, onDragStart }) {
//   const urg = URGENCE[tache.niveau_urgence] || URGENCE.moyenne;

//   return (
//     <div
//       draggable
//       onDragStart={(e) => onDragStart(e, tache.id)}
//       style={{
//         ...s.kanbanCard,
//         borderLeft: `4px solid ${urg.dot}`,
//         cursor: "grab",
//       }}
//     >
//       {/* Urgence + titre */}
//       <div style={s.kcHeader}>
//         <span style={{ ...s.kcBadge, background: urg.bg, color: urg.color }}>
//           ● {urg.label}
//         </span>
//       </div>
//       <p style={s.kcTitre}>{tache.titre}</p>

//       {/* Infos */}
//       <div style={s.kcInfos}>
//         {tache.utilisateurs && (
//           <div style={s.kcInfo}>
//             <span style={s.kcInfoIcon}>👤</span>
//             <span>{tache.utilisateurs.prenom} {tache.utilisateurs.nom}</span>
//           </div>
//         )}
//         {tache.postes_travail && (
//           <div style={s.kcInfo}>
//             <span style={s.kcInfoIcon}>🔧</span>
//             <span>{tache.postes_travail.nom}</span>
//           </div>
//         )}
//         {tache.rendezvous_id && (
//           <div style={s.kcInfo}>
//             <span style={s.kcInfoIcon}>📅</span>
//             <span style={{ fontSize: 11, color: "#9ca3af" }}>
//               RDV lié
//             </span>
//           </div>
//         )}
//         {tache.created_at && (
//           <div style={s.kcInfo}>
//             <span style={s.kcInfoIcon}>🗓️</span>
//             <span>{new Date(tache.created_at).toLocaleDateString("fr-CA")}</span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function KanbanColonne({ col, taches, onDragStart, onDrop, onDragOver, isDragOver }) {
//   return (
//     <div
//       onDrop={(e) => onDrop(e, col.id)}
//       onDragOver={onDragOver}
//       style={{
//         ...s.colonne,
//         background: isDragOver ? col.bg : "#f8fafc",
//         borderTop: `3px solid ${col.color}`,
//         outline: isDragOver ? `2px dashed ${col.color}` : "none",
//         transition: "all 0.15s ease",
//       }}
//     >
//       {/* Header colonne */}
//       <div style={s.colHeader}>
//         <div style={s.colTitleRow}>
//           <span style={{ fontSize: 18 }}>{col.emoji}</span>
//           <span style={{ ...s.colTitle, color: col.color }}>{col.label}</span>
//           <span style={{
//             ...s.colCount,
//             background: col.bg,
//             color: col.color,
//             border: `1px solid ${col.border}`,
//           }}>
//             {taches.length}
//           </span>
//         </div>
//       </div>

//       {/* Cartes */}
//       <div style={s.colBody}>
//         {taches.length === 0 ? (
//           <div style={{
//             ...s.emptyCol,
//             borderColor: col.border,
//             color: col.color + "80",
//           }}>
//             {isDragOver ? "Déposer ici ↓" : "Aucune tâche"}
//           </div>
//         ) : (
//           taches.map(t => (
//             <TacheKanbanCard key={t.id} tache={t} onDragStart={onDragStart} />
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

// export default function KanbanTaches() {
//   const navigate = useNavigate();
//   const token    = localStorage.getItem("token");
//   const authH    = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

//   const [user,       setUser]       = useState(null);
//   const [taches,     setTaches]     = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [menuOpen,   setMenuOpen]   = useState(true);
//   const [error,      setError]      = useState("");
//   const [success,    setSuccess]    = useState("");
//   const [dragOver,   setDragOver]   = useState(null); // colonne survolée
//   const [filterUrg,  setFilterUrg]  = useState("tous");
//   const [search,     setSearch]     = useState("");

//   const dragId = useRef(null);

//   useEffect(() => {
//     if (!token) return navigate("/", { replace: true });
//     init();
//   }, []);

//   const init = async () => {
//     setLoading(true);
//     try {
//       const meRes = await fetch(`${API_URL}/api/auth/me`, { headers: authH });
//       const me = meRes.ok ? await meRes.json() : null;
//       setUser(me);

//       // Gestionnaire → toutes les tâches / Employé → ses tâches
//       const url = me?.role === "gestionnaire"
//         ? `${API_URL}/api/taches/all`
//         : `${API_URL}/api/taches`;

//       const res = await fetch(url, { headers: authH });
//       const data = res.ok ? await res.json() : [];
//       setTaches(data);
//     } catch (e) {
//       setError("Impossible de charger les tâches.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Drag & Drop ────────────────────────────────────────────────────────────
//   const handleDragStart = (e, id) => {
//     dragId.current = id;
//     e.dataTransfer.effectAllowed = "move";
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.dataTransfer.dropEffect = "move";
//   };

//   const handleDrop = async (e, newStatut) => {
//     e.preventDefault();
//     setDragOver(null);
//     const id = dragId.current;
//     if (!id) return;

//     const tache = taches.find(t => t.id === id);
//     if (!tache || tache.statut === newStatut) return;

//     // Optimistic update
//     setTaches(prev =>
//       prev.map(t => t.id === id ? { ...t, statut: newStatut } : t)
//     );

//     try {
//       const res = await fetch(`${API_URL}/api/taches/${id}`, {
//         method: "PUT",
//         headers: authH,
//         body: JSON.stringify({ statut: newStatut }),
//       });
//       if (!res.ok) throw new Error("Erreur mise à jour");
//       setSuccess(`Tâche déplacée → ${COLONNES.find(c => c.id === newStatut)?.label} ✅`);
//       setTimeout(() => setSuccess(""), 2500);
//     } catch (e) {
//       // Rollback
//       setTaches(prev =>
//         prev.map(t => t.id === id ? { ...t, statut: tache.statut } : t)
//       );
//       setError("Erreur lors du déplacement");
//       setTimeout(() => setError(""), 3000);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/", { replace: true });
//   };

//   // ── Filtrage ───────────────────────────────────────────────────────────────
//   const filtered = taches
//     .filter(t => filterUrg === "tous" || t.niveau_urgence === filterUrg)
//     .filter(t => !search
//       || t.titre?.toLowerCase().includes(search.toLowerCase())
//       || t.utilisateurs?.nom?.toLowerCase().includes(search.toLowerCase())
//       || t.utilisateurs?.prenom?.toLowerCase().includes(search.toLowerCase())
//     );

//   const byStatut = (statut) => filtered.filter(t => t.statut === statut);

//   // ── Stats ─────────────────────────────────────────────────────────────────
//   const total    = taches.length;
//   const enCours  = taches.filter(t => t.statut === "en_cours").length;
//   const termine  = taches.filter(t => t.statut === "termine").length;
//   const progress = total > 0 ? Math.round((termine / total) * 100) : 0;

//   const isGestionnaire = user?.role === "gestionnaire";

//   return (
//     <div style={s.page}>
//       <Header onLogout={handleLogout} onToggleMenu={() => setMenuOpen(p => !p)} />

//       <div style={s.layout}>
//         {/* Sidebar */}
//         <aside style={{ ...s.sidebar, width: menuOpen ? 220 : 0, padding: menuOpen ? "16px 12px" : 0 }}>
//           {menuOpen && (
//             <>
//               <h3 style={s.sidebarTitle}>Navigation</h3>
//               <ul style={s.menuList}>
//                 {isGestionnaire ? [
//                   ["🏠", "Tableau de bord",  "/dashboard"],
//                   ["📅", "Rendez-vous",       "/rendez-vous"],
//                   ["✅", "Tâches",            "/gestion-taches"],
//                   ["📊", "Kanban",            "/kanban"],
//                   ["👥", "Utilisateurs",      "/utilisateurs"],
//                   ["🕐", "Créneaux",          "/crenaux"],
//                 ] : [
//                   ["🏠", "Mon dashboard",    "/dashboard-employe"],
//                   ["✅", "Mes tâches",        "/taches"],
//                   ["📊", "Kanban",            "/kanban"],
//                   ["📅", "Mes rendez-vous",   "/mes-rendez-vous"],
//                   ["🔔", "Notifications",     "/notifications"],
//                 ].map(([icon, label, path]) => (
//                   <li key={path} style={{
//                     ...s.menuItem,
//                     background: path === "/kanban"
//                       ? "rgba(255,255,255,0.15)"
//                       : "rgba(255,255,255,0.03)",
//                   }} onClick={() => navigate(path)}>
//                     {icon} {label}
//                   </li>
//                 ))}
//               </ul>
//             </>
//           )}
//         </aside>

//         {/* Main */}
//         <main style={s.main}>
//           {/* Top bar */}
//           <div style={s.topBar}>
//             <div>
//               <h1 style={s.pageTitle}>📊 Kanban des Tâches</h1>
//               <p style={s.pageSubtitle}>
//                 {isGestionnaire
//                   ? "Vue globale de toutes les tâches de l'équipe"
//                   : "Vos tâches personnelles par statut"}
//               </p>
//             </div>
//             {isGestionnaire && (
//               <button style={s.newBtn} onClick={() => navigate("/gestion-taches")}>
//                 ➕ Nouvelle tâche
//               </button>
//             )}
//           </div>

//           {error   && <div style={s.alertError}>{error}</div>}
//           {success && <div style={s.alertSuccess}>{success}</div>}

//           {/* Progress bar */}
//           <div style={s.progressCard}>
//             <div style={s.progressHeader}>
//               <span style={s.progressLabel}>Progression globale</span>
//               <span style={s.progressPct}>{progress}%</span>
//             </div>
//             <div style={s.progressBar}>
//               <div style={{ ...s.progressFill, width: `${progress}%` }} />
//             </div>
//             <div style={s.progressStats}>
//               <span>📋 {taches.filter(t => t.statut === "attribue").length} attribuées</span>
//               <span>⚙️ {enCours} en cours</span>
//               <span>✅ {termine} terminées</span>
//             </div>
//           </div>

//           {/* Filtres */}
//           <div style={s.toolbar}>
//             <input
//               style={s.searchInput}
//               placeholder="🔍 Rechercher..."
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//             />
//             <select style={s.select} value={filterUrg} onChange={e => setFilterUrg(e.target.value)}>
//               <option value="tous">Toutes urgences</option>
//               <option value="haute">🔴 Haute</option>
//               <option value="moyenne">🟡 Moyenne</option>
//               <option value="basse">🟢 Basse</option>
//             </select>
//           </div>

//           {/* Kanban board */}
//           {loading ? (
//             <p style={{ color: "#6b7280", padding: 20 }}>Chargement...</p>
//           ) : (
//             <div style={s.board}>
//               {COLONNES.map(col => (
//                 <KanbanColonne
//                   key={col.id}
//                   col={col}
//                   taches={byStatut(col.id)}
//                   onDragStart={handleDragStart}
//                   onDrop={handleDrop}
//                   onDragOver={(e) => { handleDragOver(e); setDragOver(col.id); }}
//                   isDragOver={dragOver === col.id}
//                 />
//               ))}
//             </div>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }

// const s = {
//   page: { minHeight: "100vh", width: "100%", background: "#f0f4f8", fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box", overflowX: "hidden" },
//   layout: { display: "flex", minHeight: "calc(100vh - 70px)", width: "100%" },
//   sidebar: { background: "#111827", color: "#fff", overflow: "hidden", transition: "all 0.25s ease", flexShrink: 0 },
//   sidebarTitle: { margin: "0 0 12px", fontSize: 16, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 8 },
//   menuList: { listStyle: "none", padding: 0, margin: 0 },
//   menuItem: { padding: 10, borderRadius: 8, cursor: "pointer", marginBottom: 6, fontSize: 14, transition: "0.2s" },
//   main: { flex: 1, padding: 24, minWidth: 0, boxSizing: "border-box" },
//   topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 10 },
//   pageTitle: { margin: 0, fontSize: 24, color: "#0f172a" },
//   pageSubtitle: { margin: "4px 0 0", color: "#6b7280", fontSize: 14 },
//   alertError: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 14 },
//   alertSuccess: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 14 },
//   progressCard: { background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" },
//   progressHeader: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
//   progressLabel: { fontSize: 13, fontWeight: 600, color: "#374151" },
//   progressPct: { fontSize: 13, fontWeight: 800, color: "#2563eb" },
//   progressBar: { height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", marginBottom: 10 },
//   progressFill: { height: "100%", background: "linear-gradient(90deg, #2563eb, #10b981)", borderRadius: 4, transition: "width 0.5s ease" },
//   progressStats: { display: "flex", gap: 16, fontSize: 12, color: "#6b7280" },
//   toolbar: { display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" },
//   searchInput: { flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none" },
//   select: { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", background: "#fff" },
//   newBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },
//   board: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "start", minHeight: 500 },
//   colonne: { borderRadius: 12, padding: 14, border: "1px solid #e5e7eb", minHeight: 200 },
//   colHeader: { marginBottom: 14 },
//   colTitleRow: { display: "flex", alignItems: "center", gap: 8 },
//   colTitle: { fontWeight: 800, fontSize: 15, flex: 1 },
//   colCount: { padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
//   colBody: { display: "flex", flexDirection: "column", gap: 10 },
//   emptyCol: { border: "2px dashed", borderRadius: 8, padding: "24px 12px", textAlign: "center", fontSize: 13, fontWeight: 500 },
//   kanbanCard: { background: "#fff", borderRadius: 10, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", userSelect: "none" },
//   kcHeader: { marginBottom: 6 },
//   kcBadge: { padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
//   kcTitre: { margin: "6px 0 10px", fontSize: 14, fontWeight: 700, color: "#0f172a" },
//   kcInfos: { display: "flex", flexDirection: "column", gap: 4 },
//   kcInfo: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" },
//   kcInfoIcon: { fontSize: 13, flexShrink: 0 },
// };

import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000";

const COLONNES = [
  { id: "attribue", label: "Attribué",  emoji: "📋", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  { id: "en_cours", label: "En cours",  emoji: "⚙️",  color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d" },
  { id: "termine",  label: "Terminé",   emoji: "✅",  color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
];

const URGENCE = {
  haute:   { label: "Haute",   dot: "#ef4444", bg: "#fee2e2", color: "#991b1b" },
  moyenne: { label: "Moyenne", dot: "#f59e0b", bg: "#fef3c7", color: "#92400e" },
  basse:   { label: "Basse",   dot: "#10b981", bg: "#d1fae5", color: "#065f46" },
};

function TacheKanbanCard({ tache, onDragStart }) {
  const urg = URGENCE[tache.niveau_urgence] || URGENCE.moyenne;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, tache.id)}
      style={{
        ...s.kanbanCard,
        borderLeft: `4px solid ${urg.dot}`,
        cursor: "grab",
      }}
    >
      <div style={s.kcHeader}>
        <span style={{ ...s.kcBadge, background: urg.bg, color: urg.color }}>
          ● {urg.label}
        </span>
      </div>
      <p style={s.kcTitre}>{tache.titre}</p>

      <div style={s.kcInfos}>
        {tache.utilisateurs && (
          <div style={s.kcInfo}>
            <span style={s.kcInfoIcon}>👤</span>
            <span>{tache.utilisateurs.prenom} {tache.utilisateurs.nom}</span>
          </div>
        )}
        {tache.postes_travail && (
          <div style={s.kcInfo}>
            <span style={s.kcInfoIcon}>🔧</span>
            <span>{tache.postes_travail.nom}</span>
          </div>
        )}
        {tache.rendezvous_id && (
          <div style={s.kcInfo}>
            <span style={s.kcInfoIcon}>📅</span>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>RDV lié</span>
          </div>
        )}
        {tache.created_at && (
          <div style={s.kcInfo}>
            <span style={s.kcInfoIcon}>🗓️</span>
            <span>{new Date(tache.created_at).toLocaleDateString("fr-CA")}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanColonne({ col, taches, onDragStart, onDrop, onDragOver, isDragOver }) {
  return (
    <div
      onDrop={(e) => onDrop(e, col.id)}
      onDragOver={onDragOver}
      style={{
        ...s.colonne,
        background: isDragOver ? col.bg : "#f8fafc",
        borderTop: `3px solid ${col.color}`,
        outline: isDragOver ? `2px dashed ${col.color}` : "none",
        transition: "all 0.15s ease",
      }}
    >
      <div style={s.colHeader}>
        <div style={s.colTitleRow}>
          <span style={{ fontSize: 18 }}>{col.emoji}</span>
          <span style={{ ...s.colTitle, color: col.color }}>{col.label}</span>
          <span style={{
            ...s.colCount,
            background: col.bg,
            color: col.color,
            border: `1px solid ${col.border}`,
          }}>
            {taches.length}
          </span>
        </div>
      </div>

      <div style={s.colBody}>
        {taches.length === 0 ? (
          <div style={{
            ...s.emptyCol,
            borderColor: col.border,
            color: col.color + "80",
          }}>
            {isDragOver ? "Déposer ici ↓" : "Aucune tâche"}
          </div>
        ) : (
          taches.map(t => (
            <TacheKanbanCard key={t.id} tache={t} onDragStart={onDragStart} />
          ))
        )}
      </div>
    </div>
  );
}

export default function KanbanTaches() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const authH    = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const [user,      setUser]      = useState(null);
  const [taches,    setTaches]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [menuOpen,  setMenuOpen]  = useState(true);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [dragOver,  setDragOver]  = useState(null);
  const [filterUrg, setFilterUrg] = useState("tous");
  const [search,    setSearch]    = useState("");

  const dragId = useRef(null);

  useEffect(() => {
    if (!token) return navigate("/", { replace: true });
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    try {
      const meRes = await fetch(`${API_URL}/api/auth/me`, { headers: authH });
      const me = meRes.ok ? await meRes.json() : null;
      setUser(me);

      const url = me?.role === "gestionnaire"
        ? `${API_URL}/api/taches/all`
        : `${API_URL}/api/taches`;

      const res = await fetch(url, { headers: authH });
      const data = res.ok ? await res.json() : [];
      setTaches(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("Impossible de charger les tâches.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, id) => {
    dragId.current = id;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStatut) => {
    e.preventDefault();
    setDragOver(null);
    const id = dragId.current;
    if (!id) return;

    const tache = taches.find(t => t.id === id);
    if (!tache || tache.statut === newStatut) return;

    // Optimistic update
    setTaches(prev => prev.map(t => t.id === id ? { ...t, statut: newStatut } : t));

    try {
      const res = await fetch(`${API_URL}/api/taches/${id}`, {
        method: "PUT",
        headers: authH,
        body: JSON.stringify({ statut: newStatut }),
      });
      if (!res.ok) throw new Error("Erreur mise à jour");
      setSuccess(`Tâche déplacée → ${COLONNES.find(c => c.id === newStatut)?.label} ✅`);
      setTimeout(() => setSuccess(""), 2500);
    } catch (e) {
      // Rollback
      setTaches(prev => prev.map(t => t.id === id ? { ...t, statut: tache.statut } : t));
      setError("Erreur lors du déplacement");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const filtered = taches
    .filter(t => filterUrg === "tous" || t.niveau_urgence === filterUrg)
    .filter(t => !search
      || t.titre?.toLowerCase().includes(search.toLowerCase())
      || t.utilisateurs?.nom?.toLowerCase().includes(search.toLowerCase())
      || t.utilisateurs?.prenom?.toLowerCase().includes(search.toLowerCase())
    );

  const byStatut = (statut) => filtered.filter(t => t.statut === statut);

  const total    = taches.length;
  const enCours  = taches.filter(t => t.statut === "en_cours").length;
  const termine  = taches.filter(t => t.statut === "termine").length;
  const progress = total > 0 ? Math.round((termine / total) * 100) : 0;

  const isGestionnaire = user?.role === "gestionnaire";

  const menuItems = isGestionnaire ? [
    ["🏠", "Tableau de bord", "/dashboard"],
    ["📅", "Rendez-vous",     "/rendez-vous"],
    ["✅", "Tâches",          "/gestion-taches"],
    ["📊", "Kanban",          "/kanban"],
    ["👥", "Utilisateurs",    "/utilisateurs"],
    ["🕐", "Créneaux",        "/crenaux"],
  ] : [
    ["🏠", "Mon dashboard",  "/dashboard-employe"],
    ["✅", "Mes tâches",      "/taches"],
    ["📊", "Kanban",          "/kanban"],
    ["📅", "Mes rendez-vous", "/mes-rendez-vous"],
    ["🔔", "Notifications",   "/notifications"],
  ];

  return (
    <div style={s.page}>
      <Header onLogout={handleLogout} onToggleMenu={() => setMenuOpen(p => !p)} />

      <div style={s.layout}>
        {/* Sidebar */}
        <aside style={{ ...s.sidebar, width: menuOpen ? 220 : 0, padding: menuOpen ? "16px 12px" : 0 }}>
          {menuOpen && (
            <>
              <h3 style={s.sidebarTitle}>Navigation</h3>
              <ul style={s.menuList}>
                {menuItems.map(([icon, label, path]) => (
                  <li key={path} style={{
                    ...s.menuItem,
                    background: path === "/kanban"
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(255,255,255,0.03)",
                  }} onClick={() => navigate(path)}>
                    {icon} {label}
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        {/* Main */}
        <main style={s.main}>
          <div style={s.topBar}>
            <div>
              <h1 style={s.pageTitle}>📊 Kanban des Tâches</h1>
              <p style={s.pageSubtitle}>
                {isGestionnaire
                  ? "Vue globale de toutes les tâches de l'équipe"
                  : "Vos tâches personnelles par statut"}
              </p>
            </div>
            {isGestionnaire && (
              <button style={s.newBtn} onClick={() => navigate("/gestion-taches")}>
                ➕ Nouvelle tâche
              </button>
            )}
          </div>

          {error   && <div style={s.alertError}>{error}</div>}
          {success && <div style={s.alertSuccess}>{success}</div>}

          {/* Progress bar */}
          <div style={s.progressCard}>
            <div style={s.progressHeader}>
              <span style={s.progressLabel}>Progression globale</span>
              <span style={s.progressPct}>{progress}%</span>
            </div>
            <div style={s.progressBar}>
              <div style={{ ...s.progressFill, width: `${progress}%` }} />
            </div>
            <div style={s.progressStats}>
              <span>📋 {taches.filter(t => t.statut === "attribue").length} attribuées</span>
              <span>⚙️ {enCours} en cours</span>
              <span>✅ {termine} terminées</span>
            </div>
          </div>

          {/* Filtres */}
          <div style={s.toolbar}>
            <input
              style={s.searchInput}
              placeholder="🔍 Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select style={s.select} value={filterUrg} onChange={e => setFilterUrg(e.target.value)}>
              <option value="tous">Toutes urgences</option>
              <option value="haute">🔴 Haute</option>
              <option value="moyenne">🟡 Moyenne</option>
              <option value="basse">🟢 Basse</option>
            </select>
          </div>

          {/* Kanban board */}
          {loading ? (
            <p style={{ color: "#6b7280", padding: 20 }}>Chargement...</p>
          ) : (
            <div style={s.board}>
              {COLONNES.map(col => (
                <KanbanColonne
                  key={col.id}
                  col={col}
                  taches={byStatut(col.id)}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                  onDragOver={(e) => { handleDragOver(e); setDragOver(col.id); }}
                  isDragOver={dragOver === col.id}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", width: "100%", background: "#f0f4f8", fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box", overflowX: "hidden" },
  layout: { display: "flex", minHeight: "calc(100vh - 70px)", width: "100%" },
  sidebar: { background: "#111827", color: "#fff", overflow: "hidden", transition: "all 0.25s ease", flexShrink: 0 },
  sidebarTitle: { margin: "0 0 12px", fontSize: 16, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 8 },
  menuList: { listStyle: "none", padding: 0, margin: 0 },
  menuItem: { padding: 10, borderRadius: 8, cursor: "pointer", marginBottom: 6, fontSize: 14, transition: "0.2s" },
  main: { flex: 1, padding: 24, minWidth: 0, boxSizing: "border-box" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 10 },
  pageTitle: { margin: 0, fontSize: 24, color: "#0f172a" },
  pageSubtitle: { margin: "4px 0 0", color: "#6b7280", fontSize: 14 },
  alertError: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 14 },
  alertSuccess: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 14 },
  progressCard: { background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 18, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" },
  progressHeader: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 13, fontWeight: 600, color: "#374151" },
  progressPct: { fontSize: 13, fontWeight: 800, color: "#2563eb" },
  progressBar: { height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", marginBottom: 10 },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #2563eb, #10b981)", borderRadius: 4, transition: "width 0.5s ease" },
  progressStats: { display: "flex", gap: 16, fontSize: 12, color: "#6b7280" },
  toolbar: { display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none" },
  select: { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", background: "#fff" },
  newBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },
  board: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "start", minHeight: 500 },
  colonne: { borderRadius: 12, padding: 14, border: "1px solid #e5e7eb", minHeight: 200 },
  colHeader: { marginBottom: 14 },
  colTitleRow: { display: "flex", alignItems: "center", gap: 8 },
  colTitle: { fontWeight: 800, fontSize: 15, flex: 1 },
  colCount: { padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  colBody: { display: "flex", flexDirection: "column", gap: 10 },
  emptyCol: { border: "2px dashed", borderRadius: 8, padding: "24px 12px", textAlign: "center", fontSize: 13, fontWeight: 500 },
  kanbanCard: { background: "#fff", borderRadius: 10, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", userSelect: "none" },
  kcHeader: { marginBottom: 6 },
  kcBadge: { padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  kcTitre: { margin: "6px 0 10px", fontSize: 14, fontWeight: 700, color: "#0f172a" },
  kcInfos: { display: "flex", flexDirection: "column", gap: 4 },
  kcInfo: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" },
  kcInfoIcon: { fontSize: 13, flexShrink: 0 },
};



