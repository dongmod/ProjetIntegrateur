// /// Pages de mes taches pour montrer chaque employe ses taches asignnes 

// import React, { useEffect, useState, useRef } from "react";
// import Header from "../../components/Header";
// import { useNavigate } from "react-router-dom";

// const API_URL = "http://localhost:3001";

// const URGENCE_CONFIG = {
//   haute:    { label: "Haute",    bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", order: 0 },
//   moyenne:  { label: "Moyenne",  bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", order: 1 },
//   basse:    { label: "Basse",    bg: "#d1fae5", color: "#065f46", dot: "#10b981", order: 2 },
// };

// const STATUT_CONFIG = {
//   attribue: { label: "Attribué",  bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
//   en_cours: { label: "En cours",  bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
//   termine:  { label: "Terminé",   bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" },
// };

// // ── Chrono ──────────────────────────────────────────────────────────────────
// function useChronometer(running) {
//   const [elapsed, setElapsed] = useState(0);
//   const ref = useRef(null);

//   useEffect(() => {
//     if (running) {
//       ref.current = setInterval(() => setElapsed(e => e + 1), 1000);
//     } else {
//       clearInterval(ref.current);
//     }
//     return () => clearInterval(ref.current);
//   }, [running]);

//   const reset = () => setElapsed(0);

//   const format = (s) => {
//     const h = Math.floor(s / 3600);
//     const m = Math.floor((s % 3600) / 60);
//     const sec = s % 60;
//     return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
//   };

//   return { elapsed, format: format(elapsed), reset };
// }

// // ── Carte tâche ──────────────────────────────────────────────────────────────
// function TacheCard({ tache, onDemarrer, onTerminer, activeId }) {
//   const isActive  = activeId === tache.id;
//   const chrono    = useChronometer(isActive);
//   const urgence   = URGENCE_CONFIG[tache.niveau_urgence] || URGENCE_CONFIG.moyenne;
//   const statut    = STATUT_CONFIG[tache.statut] || STATUT_CONFIG.attribue;
//   const isTermine = tache.statut === "termine";

//   return (
//     <div style={{
//       ...s.card,
//       borderLeft: `4px solid ${urgence.dot}`,
//       opacity: isTermine ? 0.7 : 1,
//     }}>
//       {/* Header */}
//       <div style={s.cardHeader}>
//         <div style={{ flex: 1 }}>
//           <div style={s.cardMeta}>
//             <span style={{ ...s.badge, background: urgence.bg, color: urgence.color }}>
//               ● {urgence.label}
//             </span>
//             <span style={{ ...s.badge, background: statut.bg, color: statut.color }}>
//               ● {statut.label}
//             </span>
//           </div>
//           <h3 style={s.cardTitle}>{tache.titre}</h3>
//         </div>
//       </div>

//       {/* Description */}
//       {tache.description && (
//         <p style={s.cardDesc}>{tache.description}</p>
//       )}

//       {/* Infos */}
//       <div style={s.infoGrid}>
//         {tache.postes_travail?.nom && (
//           <div style={s.infoItem}>
//             <span style={s.infoLabel}>🔧 Poste</span>
//             <span style={s.infoValue}>{tache.postes_travail.nom}</span>
//           </div>
//         )}
//         {tache.heure_debut && (
//           <div style={s.infoItem}>
//             <span style={s.infoLabel}>🕐 Début prévu</span>
//             <span style={s.infoValue}>{tache.heure_debut?.slice(0,5)}</span>
//           </div>
//         )}
//         {tache.heure_fin && (
//           <div style={s.infoItem}>
//             <span style={s.infoLabel}>🕕 Fin prévue</span>
//             <span style={s.infoValue}>{tache.heure_fin?.slice(0,5)}</span>
//           </div>
//         )}
//         {tache.created_at && (
//           <div style={s.infoItem}>
//             <span style={s.infoLabel}>📅 Créée le</span>
//             <span style={s.infoValue}>
//               {new Date(tache.created_at).toLocaleDateString("fr-CA")}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Chrono actif */}
//       {isActive && (
//         <div style={s.chronoBox}>
//           <span style={s.chronoIcon}>⏱️</span>
//           <span style={s.chronoTime}>{chrono.format}</span>
//           <span style={s.chronoLabel}>en cours</span>
//         </div>
//       )}

//       {/* Actions */}
//       {!isTermine && (
//         <div style={s.cardActions}>
//           {tache.statut === "attribue" && (
//             <button
//               style={s.btnDemarrer}
//               onClick={() => { chrono.reset(); onDemarrer(tache.id); }}
//             >
//               ▶️ Démarrer
//             </button>
//           )}
//           {tache.statut === "en_cours" && (
//             <button
//               style={s.btnTerminer}
//               onClick={() => onTerminer(tache)}
//             >
//               🏁 Terminer
//             </button>

//             // En cada tarjeta/fila de tâche
//           )}
//         </div>
//       )}
//     </div>
    
//   );
// }

// // ── Modal terminer ────────────────────────────────────────────────────────────
// function ModalTerminer({ tache, onConfirm, onClose }) {
//   const [commentaires, setCommentaires] = useState("");
//   const [loading, setLoading] = useState(false);

//   return (
//     <div style={s.overlay}>
//       <div style={s.modal}>
//         <h2 style={s.modalTitle}>🏁 Terminer la tâche</h2>
//         <p style={{ color: "#374151", marginBottom: 16, fontSize: 14 }}>
//           <strong>{tache.titre}</strong> — ajoutez un commentaire optionnel avant de terminer.
//         </p>
//         <textarea
//           style={s.textarea}
//           placeholder="Commentaire de fin de tâche (optionnel)..."
//           value={commentaires}
//           onChange={e => setCommentaires(e.target.value)}
//           rows={4}
//         />
//         <div style={s.modalActions}>
//           <button style={s.cancelBtn} onClick={onClose}>Annuler</button>
//           <button
//             style={s.btnTerminer}
//             disabled={loading}
//             onClick={async () => {
//               setLoading(true);
//               await onConfirm(tache.id, commentaires);
//               setLoading(false);
//             }}
//           >
//             {loading ? "..." : "🏁 Confirmer"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Page principale ───────────────────────────────────────────────────────────
// export default function MesTaches() {
//   const navigate = useNavigate();
//   const token    = localStorage.getItem("token");
//   const authH    = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

//   const [taches,    setTaches]    = useState([]);
//   const [loading,   setLoading]   = useState(true);
//   const [menuOpen,  setMenuOpen]  = useState(true);
//   const [error,     setError]     = useState("");
//   const [success,   setSuccess]   = useState("");
//   const [activeId,  setActiveId]  = useState(null); // tâche en cours (chrono)
//   const [modalTache, setModalTache] = useState(null);

//   // Filtres
//   const [filterStatut,  setFilterStatut]  = useState("tous");
//   const [filterUrgence, setFilterUrgence] = useState("tous");
//   const [search,        setSearch]        = useState("");

//   useEffect(() => {
//     if (!token) return navigate("/", { replace: true });
//     fetchTaches();
//   }, []);

//   const fetchTaches = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/api/taches`, { headers: authH });
//       const data = res.ok ? await res.json() : [];
//       setTaches(data);
//     } catch (e) {
//       setError("Impossible de charger les tâches.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDemarrer = async (id) => {
//     try {
//       const res = await fetch(`${API_URL}/api/taches/${id}`, {
//         method: "PUT",
//         headers: authH,
//         body: JSON.stringify({
//           statut: "en_cours",
//           heure_debut: new Date().toTimeString().slice(0, 8),
//         }),
//       });
//       if (!res.ok) throw new Error("Erreur");
//       setActiveId(id);
//       setSuccess("Tâche démarrée ✅");
//       setTimeout(() => setSuccess(""), 3000);
//       fetchTaches();
//     } catch (e) {
//       setError(e.message);
//     }
//   };

//   const handleTerminer = async (id, commentaires) => {
//     try {
//       const res = await fetch(`${API_URL}/api/taches/terminer`, {
//         method: "POST",
//         headers: authH,
//         body: JSON.stringify({ id, commentaires }),
//       });
//       if (!res.ok) throw new Error("Erreur");
//       setActiveId(null);
//       setModalTache(null);
//       setSuccess("Tâche terminée 🏁");
//       setTimeout(() => setSuccess(""), 3000);
//       fetchTaches();
//     } catch (e) {
//       setError(e.message);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/", { replace: true });
//   };

//   // Filtrage + tri
//   const filtered = taches
//     .filter(t => filterStatut  === "tous" || t.statut         === filterStatut)
//     .filter(t => filterUrgence === "tous" || t.niveau_urgence === filterUrgence)
//     .filter(t => !search || t.titre?.toLowerCase().includes(search.toLowerCase())
//                          || t.description?.toLowerCase().includes(search.toLowerCase()))
//     .sort((a, b) => {
//       const oa = URGENCE_CONFIG[a.niveau_urgence]?.order ?? 99;
//       const ob = URGENCE_CONFIG[b.niveau_urgence]?.order ?? 99;
//       return oa - ob;
//     });

//   // Stats
//   const counts = { attribue: 0, en_cours: 0, termine: 0 };
//   taches.forEach(t => { if (counts[t.statut] !== undefined) counts[t.statut]++; });

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
//                 {[
//                   ["🏠", "Mon dashboard",   "/dashboard-employe"],
//                   ["✅", "Mes tâches",       "/taches"],
//                   ["📅", "Mes rendez-vous",  "/mes-rendez-vous"],
//                   ["🔔", "Notifications",    "/notifications"],
//                   ["👤", "Mon profil",       "/profil"],
//                 ].map(([icon, label, path]) => (
//                   <li key={path} style={{
//                     ...s.menuItem,
//                     background: path === "/taches"
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
//           <div style={s.topBar}>
//             <div>
//               <h1 style={s.pageTitle}>✅ Mes Tâches</h1>
//               <p style={s.pageSubtitle}>Gérez et suivez vos interventions en temps réel</p>
//             </div>
//           </div>

//           {error   && <div style={s.alertError}>{error}</div>}
//           {success && <div style={s.alertSuccess}>{success}</div>}

//           {/* Stats */}
//           <div style={s.statsRow}>
//             {[
//               { label: "Attribuées", count: counts.attribue, color: "#3b82f6" },
//               { label: "En cours",   count: counts.en_cours, color: "#f59e0b" },
//               { label: "Terminées",  count: counts.termine,  color: "#9ca3af" },
//             ].map(({ label, count, color }) => (
//               <div key={label} style={s.statCard}>
//                 <span style={{ ...s.statDot, background: color }} />
//                 <span style={s.statCount}>{count}</span>
//                 <span style={s.statLabel}>{label}</span>
//               </div>
//             ))}
//           </div>

//           {/* Filtres */}
//           <div style={s.toolbar}>
//             <input
//               style={s.searchInput}
//               placeholder="🔍 Rechercher une tâche..."
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//             />
//             <select style={s.select} value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
//               <option value="tous">Tous les statuts</option>
//               <option value="attribue">Attribué</option>
//               <option value="en_cours">En cours</option>
//               <option value="termine">Terminé</option>
//             </select>
//             <select style={s.select} value={filterUrgence} onChange={e => setFilterUrgence(e.target.value)}>
//               <option value="tous">Toutes urgences</option>
//               <option value="haute">Haute</option>
//               <option value="moyenne">Moyenne</option>
//               <option value="basse">Basse</option>
//             </select>
//           </div>

//           {/* Liste */}
//           {loading ? (
//             <p style={{ color: "#6b7280", padding: 20 }}>Chargement...</p>
//           ) : filtered.length === 0 ? (
//             <div style={s.emptyState}>
//               <p style={{ fontSize: 40 }}>📭</p>
//               <p style={{ color: "#6b7280" }}>Aucune tâche trouvée</p>
//             </div>
//           ) : (
//             <div style={s.cardGrid}>
//               {filtered.map(tache => (
//                 <TacheCard
//                   key={tache.id}
//                   tache={tache}
//                   activeId={activeId}
//                   onDemarrer={handleDemarrer}
//                   onTerminer={(t) => setModalTache(t)}
//                 />
//               ))}
//             </div>
//           )}
//         </main>
//       </div>

//       {/* Modal terminer */}
//       {modalTache && (
//         <ModalTerminer
//           tache={modalTache}
//           onConfirm={handleTerminer}
//           onClose={() => setModalTache(null)}
//         />
//       )}
//     </div>
//   );
// }

// // En cada tarjeta/fila de tâche
// <button onClick={() => navigate(`/taches/${tache.id}/commentaires`)}>
//   💬 Commentaires
// </button>

// // ── Styles ────────────────────────────────────────────────────────────────────
// const s = {
//   page: { minHeight: "100vh", width: "100%", background: "#f0f4f8", fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box", overflowX: "hidden" },
//   layout: { display: "flex", minHeight: "calc(100vh - 70px)", width: "100%" },
//   sidebar: { background: "#111827", color: "#fff", overflow: "hidden", transition: "all 0.25s ease", flexShrink: 0 },
//   sidebarTitle: { margin: "0 0 12px", fontSize: 16, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 8 },
//   menuList: { listStyle: "none", padding: 0, margin: 0 },
//   menuItem: { padding: 10, borderRadius: 8, cursor: "pointer", marginBottom: 6, fontSize: 14, transition: "0.2s" },
//   main: { flex: 1, padding: 24, minWidth: 0, boxSizing: "border-box" },
//   topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
//   pageTitle: { margin: 0, fontSize: 24, color: "#0f172a" },
//   pageSubtitle: { margin: "4px 0 0", color: "#6b7280", fontSize: 14 },
//   alertError: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 14 },
//   alertSuccess: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 14 },
//   statsRow: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" },
//   statCard: { background: "#fff", borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb", minWidth: 130 },
//   statDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
//   statCount: { fontSize: 22, fontWeight: 800, color: "#0f172a" },
//   statLabel: { fontSize: 13, color: "#6b7280" },
//   toolbar: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" },
//   searchInput: { flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none" },
//   select: { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", background: "#fff", cursor: "pointer" },
//   cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },
//   card: { background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb" },
//   cardHeader: { display: "flex", gap: 10, marginBottom: 8 },
//   cardMeta: { display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" },
//   badge: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
//   cardTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" },
//   cardDesc: { margin: "8px 0", fontSize: 13, color: "#6b7280", lineHeight: 1.5 },
//   infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "12px 0" },
//   infoItem: { display: "flex", flexDirection: "column", gap: 2 },
//   infoLabel: { fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
//   infoValue: { fontSize: 13, color: "#1f2937", fontWeight: 500 },
//   chronoBox: { display: "flex", alignItems: "center", gap: 10, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 14px", margin: "10px 0" },
//   chronoIcon: { fontSize: 20 },
//   chronoTime: { fontSize: 22, fontWeight: 800, color: "#92400e", fontFamily: "monospace" },
//   chronoLabel: { fontSize: 12, color: "#b45309" },
//   cardActions: { display: "flex", gap: 8, marginTop: 14 },
//   btnDemarrer: { flex: 1, background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd", padding: "9px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
//   btnTerminer: { flex: 1, background: "#2563eb", color: "#fff", border: "none", padding: "9px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
//   emptyState: { textAlign: "center", padding: "60px 20px" },
//   overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 },
//   modal: { background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 460, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" },
//   modalTitle: { margin: "0 0 12px", fontSize: 20, color: "#0f172a" },
//   modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 },
//   cancelBtn: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
//   textarea: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" },
// };


/// Pages de mes taches pour montrer chaque employe ses taches asignnes

import React, { useEffect, useState, useRef } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3000";

const URGENCE_CONFIG = {
  haute:   { label: "Haute",   bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", order: 0 },
  moyenne: { label: "Moyenne", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", order: 1 },
  basse:   { label: "Basse",   bg: "#d1fae5", color: "#065f46", dot: "#10b981", order: 2 },
};

const STATUT_CONFIG = {
  attribue: { label: "Attribué", bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  en_cours: { label: "En cours", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  termine:  { label: "Terminé",  bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" },
};

// ── Chrono ────────────────────────────────────────────────────────────────────
function useChronometer(running) {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(ref.current);
    }
    return () => clearInterval(ref.current);
  }, [running]);

  const reset = () => setElapsed(0);
  const format = (s) => {
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  return { elapsed, format: format(elapsed), reset };
}

// ── Modal VIN (caméra + saisie manuelle) ──────────────────────────────────────
function ModalVin({ tache, token, onConfirmed, onClose }) {
  const [mode,        setMode]        = useState("choice"); // "choice" | "camera" | "manual"
  const [vinInput,    setVinInput]    = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [cameraError, setCameraError] = useState("");
  const videoRef  = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    setMode("camera");
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setCameraError("Impossible d'accéder à la caméra. Utilisez la saisie manuelle.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const captureAndScan = () => {
    // En prod: intégrer tesseract.js pour OCR du VIN
    stopCamera();
    setMode("manual");
    setError("Scan automatique en cours de développement. Veuillez saisir le VIN manuellement.");
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleVerifier = async (vin) => {
    if (!vin.trim()) return setError("Veuillez saisir le numéro VIN.");
    if (vin.trim().length < 10) return setError("Le VIN doit contenir au moins 10 caractères.");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/taches/${tache.id}/verifier-vin`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vin: vin.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "VIN incorrect.");
      } else {
        stopCamera();
        onConfirmed(tache.id, data.vehicule);
      }
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.overlay}>
      <div style={{ ...s.modal, maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ ...s.modalTitle, margin: 0 }}>🔍 Vérification du VIN</h2>
          <button onClick={handleClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>

        <p style={{ color: "#374151", fontSize: 14, marginBottom: 16 }}>
          Avant de démarrer <strong>"{tache.titre}"</strong>, confirmez le bon véhicule en
          scannant ou en saisissant son numéro VIN.
        </p>

        {error && <div style={s.alertError}>{error}</div>}

        {/* Choix du mode */}
        {mode === "choice" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              style={{ ...s.btnPrimary, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, padding: "14px" }}
              onClick={startCamera}
            >
              📷 Scanner avec la caméra
            </button>
            <button
              style={{ ...s.btnSecondary, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, padding: "14px" }}
              onClick={() => setMode("manual")}
            >
              ⌨️ Saisir manuellement le VIN
            </button>
          </div>
        )}

        {/* Mode caméra */}
        {mode === "camera" && (
          <div>
            {cameraError ? (
              <div style={s.alertError}>{cameraError}</div>
            ) : (
              <div style={{ position: "relative", background: "#000", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: "100%", maxHeight: 260, objectFit: "cover", display: "block" }}
                />
                {/* Viseur */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <div style={{ width: "80%", height: 56, border: "2px solid #22c55e", borderRadius: 6, boxShadow: "0 0 0 2000px rgba(0,0,0,0.45)" }} />
                </div>
              </div>
            )}
            <p style={{ color: "#6b7280", fontSize: 12, textAlign: "center", marginBottom: 12 }}>
              Pointez la caméra vers le numéro VIN du véhicule
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...s.btnSecondary, flex: 1 }} onClick={() => { stopCamera(); setMode("choice"); setError(""); }}>
                ← Retour
              </button>
              <button style={{ ...s.btnPrimary, flex: 1 }} onClick={captureAndScan}>
                📸 Capturer
              </button>
            </div>
            <button
              style={{ ...s.btnLink, marginTop: 10, width: "100%", textAlign: "center" }}
              onClick={() => { stopCamera(); setMode("manual"); setError(""); }}
            >
              Saisir manuellement à la place →
            </button>
          </div>
        )}

        {/* Mode saisie manuelle */}
        {mode === "manual" && (
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Numéro VIN du véhicule
            </label>
            <input
              style={{ ...s.input, fontFamily: "monospace", fontSize: 16, letterSpacing: "0.1em", textTransform: "uppercase" }}
              placeholder="Ex: 1HGBH41JXMN109186"
              value={vinInput}
              onChange={e => setVinInput(e.target.value.toUpperCase())}
              maxLength={17}
              autoFocus
            />
            <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 6 }}>
              Le VIN se trouve sur le tableau de bord (côté conducteur) ou sur la plaque de porte.
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button style={{ ...s.btnSecondary, flex: 1 }} onClick={() => { setMode("choice"); setError(""); setVinInput(""); }}>
                ← Retour
              </button>
              <button
                style={{ ...s.btnPrimary, flex: 1 }}
                disabled={loading}
                onClick={() => handleVerifier(vinInput)}
              >
                {loading ? "Vérification..." : "✅ Vérifier et démarrer"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Carte tâche ───────────────────────────────────────────────────────────────
function TacheCard({ tache, onDemarrer, onTerminer, onCommentaires, activeId }) {
  const isActive  = activeId === tache.id;
  const chrono    = useChronometer(isActive);
  const urgence   = URGENCE_CONFIG[tache.niveau_urgence] || URGENCE_CONFIG.moyenne;
  const statut    = STATUT_CONFIG[tache.statut]          || STATUT_CONFIG.attribue;
  const isTermine = tache.statut === "termine";

  return (
    <div style={{ ...s.card, borderLeft: `4px solid ${urgence.dot}`, opacity: isTermine ? 0.7 : 1 }}>
      <div style={s.cardHeader}>
        <div style={{ flex: 1 }}>
          <div style={s.cardMeta}>
            <span style={{ ...s.badge, background: urgence.bg, color: urgence.color }}>● {urgence.label}</span>
            <span style={{ ...s.badge, background: statut.bg,  color: statut.color  }}>● {statut.label}</span>
          </div>
          <h3 style={s.cardTitle}>{tache.titre}</h3>
        </div>
      </div>

      {tache.description && <p style={s.cardDesc}>{tache.description}</p>}

      <div style={s.infoGrid}>
        {tache.postes_travail?.nom && (
          <div style={s.infoItem}>
            <span style={s.infoLabel}>🔧 Poste</span>
            <span style={s.infoValue}>{tache.postes_travail.nom}</span>
          </div>
        )}
        {tache.heure_debut && (
          <div style={s.infoItem}>
            <span style={s.infoLabel}>🕐 Début prévu</span>
            <span style={s.infoValue}>{tache.heure_debut?.slice(0,5)}</span>
          </div>
        )}
        {tache.heure_fin && (
          <div style={s.infoItem}>
            <span style={s.infoLabel}>🕕 Fin prévue</span>
            <span style={s.infoValue}>{tache.heure_fin?.slice(0,5)}</span>
          </div>
        )}
        {tache.created_at && (
          <div style={s.infoItem}>
            <span style={s.infoLabel}>📅 Créée le</span>
            <span style={s.infoValue}>{new Date(tache.created_at).toLocaleDateString("fr-CA")}</span>
          </div>
        )}
      </div>

      {/* Chronomètre si en cours */}
      {isActive && (
        <div style={s.chronoBox}>
          <span style={s.chronoIcon}>⏱️</span>
          <span style={s.chronoTime}>{chrono.format}</span>
          <span style={s.chronoLabel}>en cours</span>
        </div>
      )}

      {/* Notification envoyée */}
      {tache.statut === "en_cours" && !isActive && (
        <div style={s.notifBox}>
          📧 Le client a été notifié du démarrage
        </div>
      )}

      <div style={s.cardActions}>
        {/* Démarrer → vérification VIN obligatoire */}
        {!isTermine && tache.statut === "attribue" && (
          <button style={s.btnDemarrer} onClick={() => { chrono.reset(); onDemarrer(tache); }}>
            ▶️ Démarrer
          </button>
        )}
        {/* Terminer */}
        {!isTermine && tache.statut === "en_cours" && (
          <button style={s.btnTerminer} onClick={() => onTerminer(tache)}>
            🏁 Terminer
          </button>
        )}
        {/* Terminé label */}
        {isTermine && (
          <span style={s.terminéLabel}>✅ Terminée</span>
        )}
        {/* Commentaires */}
        <button style={s.btnCommentaires} onClick={() => onCommentaires(tache.id)} title="Commentaires">
          💬
        </button>
      </div>
    </div>
  );
}

// ── Modal terminer ─────────────────────────────────────────────────────────────
function ModalTerminer({ tache, onConfirm, onClose }) {
  const [commentaires, setCommentaires] = useState("");
  const [loading,      setLoading]      = useState(false);

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ ...s.modalTitle, margin: 0 }}>🏁 Terminer la tâche</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}>✕</button>
        </div>

        <p style={{ color: "#374151", marginBottom: 6, fontSize: 14 }}>
          <strong>{tache.titre}</strong>
        </p>
        <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 16 }}>
          En terminant cette tâche, le client recevra automatiquement un email de notification.
        </p>

        {/* Info notification */}
        <div style={s.infoNotifBox}>
          <span style={{ fontSize: 18 }}>📧</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#1e40af" }}>Notification automatique</div>
            <div style={{ fontSize: 12, color: "#3b82f6" }}>Un email sera envoyé au client pour récupérer son véhicule.</div>
          </div>
        </div>

        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
          Commentaire de fin (optionnel)
        </label>
        <textarea
          style={s.textarea}
          placeholder="Ex: Vidange effectuée, filtres changés, test routier effectué..."
          value={commentaires}
          onChange={e => setCommentaires(e.target.value)}
          rows={4}
        />

        <div style={s.modalActions}>
          <button style={s.cancelBtn} onClick={onClose}>Annuler</button>
          <button
            style={s.btnTerminer}
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              await onConfirm(tache.id, commentaires);
              setLoading(false);
            }}
          >
            {loading ? "Envoi..." : "🏁 Confirmer et notifier"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function MesTaches() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const authH    = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const [taches,     setTaches]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [menuOpen,   setMenuOpen]   = useState(true);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [activeId,   setActiveId]   = useState(null);
  const [modalTache, setModalTache] = useState(null);
  const [vinTache,   setVinTache]   = useState(null);

  const [filterStatut,  setFilterStatut]  = useState("tous");
  const [filterUrgence, setFilterUrgence] = useState("tous");
  const [search,        setSearch]        = useState("");

  useEffect(() => {
    if (!token) return navigate("/", { replace: true });
    fetchTaches();
  }, []);

  const fetchTaches = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/taches`, { headers: authH });
      const data = res.ok ? await res.json() : [];
      setTaches(Array.isArray(data) ? data : []);
    } catch {
      setError("Impossible de charger les tâches.");
    } finally {
      setLoading(false);
    }
  };

  // ── Étape 1 : ouvrir modal VIN avant démarrage ────────────────────────────
  const handleDemanderVin = (tache) => {
    setError("");
    setVinTache(tache);
  };

  // ── Étape 2 : VIN vérifié → appeler POST /commencer/:id ──────────────────
  const handleVinConfirmed = async (tacheId, vehicule) => {
    setVinTache(null);
    try {
      const res = await fetch(`${API_URL}/api/taches/commencer/${tacheId}`, {
        method: "POST",
        headers: authH,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur démarrage");
      }
      setActiveId(tacheId);
      setSuccess(`✅ Tâche démarrée — ${vehicule.marque} ${vehicule.modele} (${vehicule.plaque}). Le client a été notifié.`);
      setTimeout(() => setSuccess(""), 6000);
      fetchTaches();
    } catch (e) {
      setError(e.message);
    }
  };

  // ── Terminer → appeler POST /terminer/:id ─────────────────────────────────
  const handleTerminer = async (id, commentaires) => {
    try {
      const res = await fetch(`${API_URL}/api/taches/terminer/${id}`, {
        method: "POST",
        headers: authH,
        body: JSON.stringify({ commentaires }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erreur");
      }
      setActiveId(null);
      setModalTache(null);
      setSuccess("Tâche terminée 🏁 — Le client a été notifié par email.");
      setTimeout(() => setSuccess(""), 6000);
      fetchTaches();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const filtered = taches
    .filter(t => filterStatut  === "tous" || t.statut         === filterStatut)
    .filter(t => filterUrgence === "tous" || t.niveau_urgence === filterUrgence)
    .filter(t => !search
      || t.titre?.toLowerCase().includes(search.toLowerCase())
      || t.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      // En cours en premier, puis attribué, puis terminé
      const order = { en_cours: 0, attribue: 1, termine: 2 };
      if (order[a.statut] !== order[b.statut]) return order[a.statut] - order[b.statut];
      // Puis par urgence
      const oa = URGENCE_CONFIG[a.niveau_urgence]?.order ?? 99;
      const ob = URGENCE_CONFIG[b.niveau_urgence]?.order ?? 99;
      return oa - ob;
    });

  const counts = { attribue: 0, en_cours: 0, termine: 0 };
  taches.forEach(t => { if (counts[t.statut] !== undefined) counts[t.statut]++; });

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
                {[
                  ["🏠", "Mon dashboard",  "/dashboard-employe"],
                  ["✅", "Mes tâches",     "/taches"],
                  ["📊", "Kanban",         "/kanban"],
                  ["📅", "Mes rendez-vous","/mes-rendez-vous"],
                  ["🔔", "Notifications",  "/notifications"],
                  ["👤", "Mon profil",     "/profil"],
                ].map(([icon, label, path]) => (
                  <li key={path} style={{
                    ...s.menuItem,
                    background: path === "/taches"
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

        <main style={s.main}>
          <div style={s.topBar}>
            <div>
              <h1 style={s.pageTitle}>✅ Mes Tâches</h1>
              <p style={s.pageSubtitle}>Gérez et suivez vos interventions en temps réel</p>
            </div>
          </div>

          {error   && <div style={s.alertError}>{error}</div>}
          {success && <div style={s.alertSuccess}>{success}</div>}

          {/* Stats */}
          <div style={s.statsRow}>
            {[
              { label: "Attribuées", count: counts.attribue, color: "#3b82f6" },
              { label: "En cours",   count: counts.en_cours, color: "#f59e0b" },
              { label: "Terminées",  count: counts.termine,  color: "#9ca3af" },
            ].map(({ label, count, color }) => (
              <div key={label} style={s.statCard}>
                <span style={{ ...s.statDot, background: color }} />
                <span style={s.statCount}>{count}</span>
                <span style={s.statLabel}>{label}</span>
              </div>
            ))}
          </div>

          {/* Filtres */}
          <div style={s.toolbar}>
            <input
              style={s.searchInput}
              placeholder="🔍 Rechercher une tâche..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select style={s.select} value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
              <option value="tous">Tous les statuts</option>
              <option value="attribue">Attribué</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
            </select>
            <select style={s.select} value={filterUrgence} onChange={e => setFilterUrgence(e.target.value)}>
              <option value="tous">Toutes urgences</option>
              <option value="haute">🔴 Haute</option>
              <option value="moyenne">🟡 Moyenne</option>
              <option value="basse">🟢 Basse</option>
            </select>
          </div>

          {/* Cards */}
          {loading ? (
            <p style={{ color: "#6b7280", padding: 20 }}>Chargement...</p>
          ) : filtered.length === 0 ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 40 }}>📭</p>
              <p style={{ color: "#6b7280" }}>Aucune tâche trouvée</p>
            </div>
          ) : (
            <div style={s.cardGrid}>
              {filtered.map(tache => (
                <TacheCard
                  key={tache.id}
                  tache={tache}
                  activeId={activeId}
                  onDemarrer={handleDemanderVin}
                  onTerminer={(t) => setModalTache(t)}
                  onCommentaires={(id) => navigate(`/taches/${id}/commentaires`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal VIN */}
      {vinTache && (
        <ModalVin
          tache={vinTache}
          token={token}
          onConfirmed={handleVinConfirmed}
          onClose={() => setVinTache(null)}
        />
      )}

      {/* Modal terminer */}
      {modalTache && (
        <ModalTerminer
          tache={modalTache}
          onConfirm={handleTerminer}
          onClose={() => setModalTache(null)}
        />
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", width: "100%", background: "#f0f4f8", fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box", overflowX: "hidden" },
  layout: { display: "flex", minHeight: "calc(100vh - 70px)", width: "100%" },
  sidebar: { background: "#111827", color: "#fff", overflow: "hidden", transition: "all 0.25s ease", flexShrink: 0 },
  sidebarTitle: { margin: "0 0 12px", fontSize: 16, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 8 },
  menuList: { listStyle: "none", padding: 0, margin: 0 },
  menuItem: { padding: 10, borderRadius: 8, cursor: "pointer", marginBottom: 6, fontSize: 14, transition: "0.2s" },
  main: { flex: 1, padding: 24, minWidth: 0, boxSizing: "border-box" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  pageTitle: { margin: 0, fontSize: 24, color: "#0f172a" },
  pageSubtitle: { margin: "4px 0 0", color: "#6b7280", fontSize: 14 },
  alertError: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 14 },
  alertSuccess: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 14 },
  statsRow: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" },
  statCard: { background: "#fff", borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb", minWidth: 130 },
  statDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  statCount: { fontSize: 22, fontWeight: 800, color: "#0f172a" },
  statLabel: { fontSize: 13, color: "#6b7280" },
  toolbar: { display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none" },
  select: { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", background: "#fff", cursor: "pointer" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },
  card: { background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb" },
  cardHeader: { display: "flex", gap: 10, marginBottom: 8 },
  cardMeta: { display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" },
  badge: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  cardTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" },
  cardDesc: { margin: "8px 0", fontSize: 13, color: "#6b7280", lineHeight: 1.5 },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "12px 0" },
  infoItem: { display: "flex", flexDirection: "column", gap: 2 },
  infoLabel: { fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
  infoValue: { fontSize: 13, color: "#1f2937", fontWeight: 500 },
  chronoBox: { display: "flex", alignItems: "center", gap: 10, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 14px", margin: "10px 0" },
  chronoIcon: { fontSize: 20 },
  chronoTime: { fontSize: 22, fontWeight: 800, color: "#92400e", fontFamily: "monospace" },
  chronoLabel: { fontSize: 12, color: "#b45309" },
  notifBox: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#1e40af", margin: "8px 0" },
  infoNotifBox: { display: "flex", alignItems: "flex-start", gap: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px 14px", marginBottom: 16 },
  terminéLabel: { flex: 1, fontSize: 13, color: "#6b7280", fontStyle: "italic", display: "flex", alignItems: "center" },
  cardActions: { display: "flex", gap: 8, marginTop: 14 },
  btnDemarrer: { flex: 1, background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd", padding: "9px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
  btnTerminer: { flex: 1, background: "#2563eb", color: "#fff", border: "none", padding: "9px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
  btnCommentaires: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 16 },
  emptyState: { textAlign: "center", padding: "60px 20px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 },
  modal: { background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 460, boxShadow: "0 20px 50px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { margin: "0 0 12px", fontSize: 20, color: "#0f172a" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 },
  cancelBtn: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  textarea: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", boxSizing: "border-box" },
  btnPrimary: { background: "#2563eb", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },
  btnSecondary: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  btnLink: { background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: 13, textDecoration: "underline", padding: "4px 0" },
};