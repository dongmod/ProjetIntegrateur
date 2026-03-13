// import React, { useEffect, useState, useRef } from "react";
// import Header from "../../components/Header";
// import { useNavigate } from "react-router-dom";

// const API_URL = "http://localhost:3001";

// const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
// const MOIS = [
//   "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
//   "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
// ];

// const STATUT_COLORS = {
//   planifie:  { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
//   confirme:  { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
//   termine:   { bg: "#f3f4f6", border: "#9ca3af", text: "#374151" },
//   annule:    { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
// };

// // ─── helpers ────────────────────────────────────────────────────────────────
// const isoDate = (d) => d.toISOString().split("T")[0];

// const startOfMonth = (y, m) => new Date(y, m, 1);
// const daysInMonth  = (y, m) => new Date(y, m + 1, 0).getDate();

// // lundi = 0 … dimanche = 6
// const dayOfWeek = (d) => (d.getDay() + 6) % 7;

// function buildCalendarGrid(year, month) {
//   const firstDay = dayOfWeek(startOfMonth(year, month));
//   const total    = daysInMonth(year, month);
//   const cells    = [];

//   for (let i = 0; i < firstDay; i++) cells.push(null);
//   for (let d = 1; d <= total; d++) cells.push(d);
//   while (cells.length % 7 !== 0) cells.push(null);
//   return cells;
// }

// function detectConflicts(rdvList) {
//   const conflicts = new Set();
//   for (let i = 0; i < rdvList.length; i++) {
//     for (let j = i + 1; j < rdvList.length; j++) {
//       const a = rdvList[i];
//       const b = rdvList[j];
//       const sameDate = a.date_rendezvous?.slice(0, 10) === b.date_rendezvous?.slice(0, 10);
//       const sameEmploye = a.employe_id && a.employe_id === b.employe_id;
//       const samePoste   = a.poste_travail_id && a.poste_travail_id === b.poste_travail_id;
//       if (sameDate && (sameEmploye || samePoste)) {
//         conflicts.add(a.id);
//         conflicts.add(b.id);
//       }
//     }
//   }
//   return conflicts;
// }

// // ─── Modal RDV ───────────────────────────────────────────────────────────────
// function RdvModal({ rdv, employes, postes, onClose, onSave, onDelete }) {
//   const [form, setForm] = useState({
//     date_rendezvous: rdv?.date_rendezvous?.slice(0, 16) || "",
//     type_service:    rdv?.type_service || "",
//     statut:          rdv?.statut || "planifie",
//     employe_id:      rdv?.employe_id || "",
//     poste_travail_id: rdv?.poste_travail_id || "",
//   });

//   const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

//   return (
//     <div style={s.overlay}>
//       <div style={s.modal}>
//         <h2 style={s.modalTitle}>
//           {rdv ? "✏️ Modifier le RDV" : "➕ Nouveau RDV"}
//         </h2>

//         <div style={s.formGrid}>
//           <div style={s.fg}>
//             <label style={s.label}>Date & heure</label>
//             <input style={s.input} type="datetime-local" name="date_rendezvous"
//               value={form.date_rendezvous} onChange={handle} />
//           </div>
//           <div style={s.fg}>
//             <label style={s.label}>Service</label>
//             <input style={s.input} type="text" name="type_service"
//               placeholder="Ex: vidange, freins…" value={form.type_service} onChange={handle} />
//           </div>
//           <div style={s.fg}>
//             <label style={s.label}>Statut</label>
//             <select style={s.input} name="statut" value={form.statut} onChange={handle}>
//               {["planifie","confirme","termine","annule"].map(st =>
//                 <option key={st} value={st}>{st}</option>)}
//             </select>
//           </div>
//           <div style={s.fg}>
//             <label style={s.label}>Employé assigné</label>
//             <select style={s.input} name="employe_id" value={form.employe_id} onChange={handle}>
//               <option value="">— Aucun —</option>
//               {employes.map(e => (
//                 <option key={e.user_id} value={e.user_id}>
//                   {e.prenom} {e.nom}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div style={s.fg}>
//             <label style={s.label}>Poste de travail</label>
//             <select style={s.input} name="poste_travail_id" value={form.poste_travail_id} onChange={handle}>
//               <option value="">— Aucun —</option>
//               {postes.map(p => (
//                 <option key={p.id} value={p.id}>{p.nom}</option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div style={s.modalActions}>
//           {rdv && (
//             <button style={s.deleteBtn} onClick={() => onDelete(rdv.id)}>
//               🗑️ Supprimer
//             </button>
//           )}
//           <div style={{ display:"flex", gap:8 }}>
//             <button style={s.cancelBtn} onClick={onClose}>Annuler</button>
//             <button style={s.confirmBtn} onClick={() => onSave(form)}>
//               {rdv ? "Enregistrer" : "Créer"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function CalendrierRDV() {
//   const navigate  = useNavigate();
//   const token     = localStorage.getItem("token");
//   const authH     = { "Content-Type":"application/json", Authorization:`Bearer ${token}` };

//   const now = new Date();
//   const [year,  setYear]  = useState(now.getFullYear());
//   const [month, setMonth] = useState(now.getMonth());

//   const [rdvList,   setRdvList]   = useState([]);
//   const [employes,  setEmployes]  = useState([]);
//   const [postes,    setPostes]    = useState([]);
//   const [loading,   setLoading]   = useState(true);
//   const [menuOpen,  setMenuOpen]  = useState(true);

//   const [modal,     setModal]     = useState(null); // null | { mode:"create"|"edit", rdv, date }
//   const [dragId,    setDragId]    = useState(null);
//   const [conflicts, setConflicts] = useState(new Set());

//   // ── fetch ──────────────────────────────────────────────────────────────────
//   const fetchAll = async () => {
//     setLoading(true);
//     try {
//       const [rdvRes, empRes, posteRes] = await Promise.all([
//         fetch(`${API_URL}/api/rendezvous/all`, { headers: authH }),
//         fetch(`${API_URL}/api/auth/getUser`,   { headers: authH }),
//         fetch(`${API_URL}/api/posteTravail`,   { headers: authH }),
//       ]);
//       const rdv   = rdvRes.ok   ? await rdvRes.json()   : [];
//       const emp   = empRes.ok   ? await empRes.json()   : [];
//       const poste = posteRes.ok ? await posteRes.json() : [];

//       const employes = emp.filter(u => u.role === "employe");
//       setRdvList(rdv);
//       setEmployes(employes);
//       setPostes(poste);
//       setConflicts(detectConflicts(rdv));
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!token) return navigate("/", { replace:true });
//     fetchAll();
//   }, []);

//   // ── navigation mois ────────────────────────────────────────────────────────
//   const prevMonth = () => {
//     if (month === 0) { setYear(y => y-1); setMonth(11); }
//     else setMonth(m => m-1);
//   };
//   const nextMonth = () => {
//     if (month === 11) { setYear(y => y+1); setMonth(0); }
//     else setMonth(m => m+1);
//   };

//   // ── RDV par jour ──────────────────────────────────────────────────────────
//   const rdvByDay = {};
//   rdvList.forEach(r => {
//     const day = r.date_rendezvous?.slice(0, 10);
//     if (!rdvByDay[day]) rdvByDay[day] = [];
//     rdvByDay[day].push(r);
//   });

//   const cells = buildCalendarGrid(year, month);

//   // ── CRUD ──────────────────────────────────────────────────────────────────
//   const handleSave = async (form) => {
//     const isEdit = modal?.mode === "edit";
//     const url    = isEdit
//       ? `${API_URL}/api/rendezvous/${modal.rdv.id}/assigner`
//       : `${API_URL}/api/rendezvous`;
//     const method = isEdit ? "PATCH" : "POST";

//     const res = await fetch(url, {
//       method, headers: authH, body: JSON.stringify(form)
//     });
//     if (res.ok) { setModal(null); fetchAll(); }
//     else {
//       const err = await res.json();
//       alert(err.message || "Erreur");
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Supprimer ce rendez-vous ?")) return;
//     await fetch(`${API_URL}/api/rendezvous/${id}`, { method:"DELETE", headers: authH });
//     setModal(null);
//     fetchAll();
//   };

//   // ── Drag & Drop ──────────────────────────────────────────────────────────
//   const handleDragStart = (e, rdvId) => {
//     setDragId(rdvId);
//     e.dataTransfer.effectAllowed = "move";
//   };

//   const handleDrop = async (e, targetDate) => {
//     e.preventDefault();
//     if (!dragId) return;
//     const rdv = rdvList.find(r => r.id === dragId);
//     if (!rdv) return;

//     const oldDate   = rdv.date_rendezvous;
//     const oldTime   = oldDate?.slice(11) || "09:00:00";
//     const newDate   = `${targetDate}T${oldTime}`;

//     // Détection conflit avant save
//     const sameDay = rdvList.filter(r =>
//       r.id !== dragId && r.date_rendezvous?.slice(0,10) === targetDate
//     );
//     const hasConflict = sameDay.some(r =>
//       (rdv.employe_id && r.employe_id === rdv.employe_id) ||
//       (rdv.poste_travail_id && r.poste_travail_id === rdv.poste_travail_id)
//     );

//     if (hasConflict) {
//       alert("⚠️ Conflit détecté : cet employé ou poste est déjà assigné ce jour-là !");
//       setDragId(null);
//       return;
//     }

//     await fetch(`${API_URL}/api/rendezvous/${dragId}/assigner`, {
//       method: "PATCH",
//       headers: authH,
//       body: JSON.stringify({ ...rdv, date_rendezvous: newDate }),
//     });
//     setDragId(null);
//     fetchAll();
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/", { replace:true });
//   };

//   // ── render ────────────────────────────────────────────────────────────────
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
//                   ["🏠","Tableau de bord","/dashboard"],
//                   ["📅","Rendez-vous","/rendez-vous"],
//                   ["✅","Tâches","/taches"],
//                   ["👥","Utilisateurs","/utilisateurs"],
//                   ["🛠️","Services","/services"],
//                   ["🚗","Véhicules","/vehicules"],
//                   ["🔔","Notifications","/notifications"],
//                   ["⚙️","Paramètres","/parametres"],
//                 ].map(([icon, label, path]) => (
//                   <li key={path} style={{
//                     ...s.menuItem,
//                     background: path === "/rendez-vous" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.03)"
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
//               <h1 style={s.pageTitle}>📅 Calendrier des Rendez-vous</h1>
//               <p style={s.pageSubtitle}>Vue mensuelle — glissez un RDV pour le déplacer</p>
//             </div>
//             <button style={s.newBtn} onClick={() => setModal({ mode:"create", rdv:null, date: isoDate(now) })}>
//               + Nouveau RDV
//             </button>
//           </div>

//           {/* Légende conflits */}
//           {conflicts.size > 0 && (
//             <div style={s.conflictBanner}>
//               ⚠️ {conflicts.size} rendez-vous en conflit détecté{conflicts.size > 1 ? "s" : ""} — vérifiez les cases orangées
//             </div>
//           )}

//           {/* Nav mois */}
//           <div style={s.monthNav}>
//             <button style={s.navBtn} onClick={prevMonth}>‹</button>
//             <span style={s.monthLabel}>{MOIS[month]} {year}</span>
//             <button style={s.navBtn} onClick={nextMonth}>›</button>
//           </div>

//           {/* Calendrier */}
//           {loading ? (
//             <p style={{ padding:20, color:"#6b7280" }}>Chargement...</p>
//           ) : (
//             <div style={s.calendarWrapper}>
//               {/* Entêtes jours */}
//               <div style={s.calGrid}>
//                 {JOURS.map(j => (
//                   <div key={j} style={s.dayHeader}>{j}</div>
//                 ))}

//                 {cells.map((day, idx) => {
//                   const dateStr = day
//                     ? `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`
//                     : null;
//                   const dayRdv = dateStr ? (rdvByDay[dateStr] || []) : [];
//                   const isToday = dateStr === isoDate(now);
//                   const hasConflictDay = dayRdv.some(r => conflicts.has(r.id));

//                   return (
//                     <div
//                       key={idx}
//                       style={{
//                         ...s.cell,
//                         ...(day ? {} : s.emptyCell),
//                         ...(isToday ? s.todayCell : {}),
//                         ...(hasConflictDay ? s.conflictCell : {}),
//                       }}
//                       onDragOver={day ? (e) => e.preventDefault() : undefined}
//                       onDrop={day ? (e) => handleDrop(e, dateStr) : undefined}
//                       onClick={() => day && setModal({ mode:"create", rdv:null, date: dateStr })}
//                     >
//                       {day && (
//                         <>
//                           <span style={{
//                             ...s.dayNum,
//                             ...(isToday ? s.todayNum : {})
//                           }}>{day}</span>

//                           <div style={s.rdvList}>
//                             {dayRdv.map(rdv => {
//                               const col = STATUT_COLORS[rdv.statut] || STATUT_COLORS.planifie;
//                               const isConflict = conflicts.has(rdv.id);
//                               return (
//                                 <div
//                                   key={rdv.id}
//                                   draggable
//                                   onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, rdv.id); }}
//                                   onClick={(e) => { e.stopPropagation(); setModal({ mode:"edit", rdv }); }}
//                                   style={{
//                                     ...s.rdvChip,
//                                     background: isConflict ? "#fff3cd" : col.bg,
//                                     borderLeft: `3px solid ${isConflict ? "#f59e0b" : col.border}`,
//                                     color: isConflict ? "#92400e" : col.text,
//                                   }}
//                                   title={`${rdv.type_service} — ${rdv.statut}`}
//                                 >
//                                   <span style={s.chipTime}>
//                                     {rdv.date_rendezvous?.slice(11,16)}
//                                   </span>
//                                   <span style={s.chipService} className="chip-service">
//                                     {rdv.vehicules?.marque} {rdv.vehicules?.modele}
//                                   </span>
//                                   {isConflict && <span style={s.conflictDot}>⚠️</span>}
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Légende statuts */}
//           <div style={s.legend}>
//             {Object.entries(STATUT_COLORS).map(([st, col]) => (
//               <div key={st} style={s.legendItem}>
//                 <span style={{ ...s.legendDot, background: col.border }} />
//                 {st}
//               </div>
//             ))}
//             <div style={s.legendItem}>
//               <span style={{ ...s.legendDot, background: "#f59e0b" }} />
//               conflit
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* Modal */}
//       {modal && (
//         <RdvModal
//           rdv={modal.rdv}
//           employes={employes}
//           postes={postes}
//           onClose={() => setModal(null)}
//           onSave={handleSave}
//           onDelete={handleDelete}
//         />
//       )}
//     </div>
//   );
// }

// // ─── Styles ──────────────────────────────────────────────────────────────────
// const s = {
//   page: { minHeight:"100vh", width:"100%", background:"#f0f4f8", fontFamily:"'Segoe UI',sans-serif", boxSizing:"border-box", overflowX:"hidden" },
//   layout: { display:"flex", minHeight:"calc(100vh - 70px)", width:"100%" },
//   sidebar: { background:"#111827", color:"#fff", overflow:"hidden", transition:"all 0.25s ease", flexShrink:0 },
//   sidebarTitle: { margin:"0 0 12px", fontSize:16, borderBottom:"1px solid rgba(255,255,255,0.2)", paddingBottom:8 },
//   menuList: { listStyle:"none", padding:0, margin:0 },
//   menuItem: { padding:10, borderRadius:8, cursor:"pointer", marginBottom:6, fontSize:14, transition:"0.2s" },
//   main: { flex:1, padding:20, minWidth:0, boxSizing:"border-box" },
//   topBar: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:10 },
//   pageTitle: { margin:0, fontSize:24, color:"#0f172a" },
//   pageSubtitle: { margin:"4px 0 0", color:"#6b7280", fontSize:13 },
//   newBtn: { background:"#2563eb", color:"#fff", border:"none", padding:"10px 18px", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:14 },
//   conflictBanner: { background:"#fff3cd", border:"1px solid #f59e0b", color:"#92400e", borderRadius:8, padding:"10px 14px", marginBottom:12, fontSize:14, fontWeight:600 },
//   monthNav: { display:"flex", alignItems:"center", gap:16, marginBottom:14, justifyContent:"center" },
//   navBtn: { background:"#fff", border:"1px solid #d1d5db", borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:18, color:"#374151" },
//   monthLabel: { fontSize:20, fontWeight:700, color:"#0f172a", minWidth:200, textAlign:"center" },
//   calendarWrapper: { background:"#fff", borderRadius:14, boxShadow:"0 2px 12px rgba(0,0,0,0.07)", border:"1px solid #e5e7eb", overflow:"hidden" },
//   calGrid: { display:"grid", gridTemplateColumns:"repeat(7, 1fr)" },
//   dayHeader: { padding:"10px 0", textAlign:"center", fontWeight:700, fontSize:13, color:"#6b7280", background:"#f9fafb", borderBottom:"1px solid #e5e7eb" },
//   cell: { minHeight:110, borderRight:"1px solid #f3f4f6", borderBottom:"1px solid #f3f4f6", padding:"6px 5px", cursor:"pointer", transition:"background 0.15s", position:"relative" },
//   emptyCell: { background:"#fafafa", cursor:"default" },
//   todayCell: { background:"#eff6ff" },
//   conflictCell: { background:"#fffbeb" },
//   dayNum: { fontSize:13, fontWeight:600, color:"#374151", display:"block", marginBottom:4 },
//   todayNum: { background:"#2563eb", color:"#fff", borderRadius:"50%", width:24, height:24, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:12 },
//   rdvList: { display:"flex", flexDirection:"column", gap:3 },
//   rdvChip: { borderRadius:5, padding:"3px 6px", fontSize:11, cursor:"grab", display:"flex", alignItems:"center", gap:4, overflow:"hidden" },
//   chipTime: { fontWeight:700, flexShrink:0 },
//   chipService: { overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 },
//   conflictDot: { flexShrink:0 },
//   legend: { display:"flex", gap:16, marginTop:14, flexWrap:"wrap" },
//   legendItem: { display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#6b7280" },
//   legendDot: { width:10, height:10, borderRadius:"50%", display:"inline-block" },
//   // Modal
//   overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:16 },
//   modal: { background:"#fff", borderRadius:14, padding:28, width:"100%", maxWidth:520, boxShadow:"0 20px 50px rgba(0,0,0,0.2)", maxHeight:"90vh", overflowY:"auto" },
//   modalTitle: { margin:"0 0 18px", fontSize:20, color:"#0f172a" },
//   formGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 },
//   fg: { display:"flex", flexDirection:"column", gap:5 },
//   label: { fontSize:13, fontWeight:600, color:"#374151" },
//   input: { padding:"9px 12px", borderRadius:8, border:"1px solid #d1d5db", fontSize:14, outline:"none", width:"100%", boxSizing:"border-box" },
//   modalActions: { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:22 },
//   deleteBtn: { background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", padding:"9px 14px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 },
//   cancelBtn: { background:"#f3f4f6", color:"#374151", border:"1px solid #d1d5db", padding:"9px 18px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14 },
//   confirmBtn: { background:"#2563eb", color:"#fff", border:"none", padding:"9px 18px", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:14 },
// };





import React, { useEffect, useState, useRef } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
import socket from "../../lib/socket";

const API_URL = "http://localhost:3001";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const STATUT_COLORS = {
  planifie: { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  confirme: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
  en_cours: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
  termine:  { bg: "#f3f4f6", border: "#9ca3af", text: "#374151" },
  annule:   { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const isoDate     = (d) => d.toISOString().split("T")[0];
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const dayOfWeek   = (d) => (d.getDay() + 6) % 7;

function buildCalendarGrid(year, month) {
  const firstDay = dayOfWeek(new Date(year, month, 1));
  const total    = daysInMonth(year, month);
  const cells    = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function detectConflicts(rdvList) {
  const conflicts = new Set();
  for (let i = 0; i < rdvList.length; i++) {
    for (let j = i + 1; j < rdvList.length; j++) {
      const a = rdvList[i], b = rdvList[j];
      const sameDate    = a.date_rendezvous?.slice(0,10) === b.date_rendezvous?.slice(0,10);
      const sameEmploye = a.employe_id && a.employe_id === b.employe_id;
      const samePoste   = a.poste_travail_id && a.poste_travail_id === b.poste_travail_id;
      if (sameDate && (sameEmploye || samePoste)) {
        conflicts.add(a.id);
        conflicts.add(b.id);
      }
    }
  }
  return conflicts;
}

// ─── Live badge ───────────────────────────────────────────────────────────────
function LiveBadge({ connected }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6, fontSize: 12,
      color: connected ? "#16a34a" : "#9ca3af",
      background: connected ? "#f0fdf4" : "#f9fafb",
      border: `1px solid ${connected ? "#bbf7d0" : "#e5e7eb"}`,
      borderRadius: 20, padding: "3px 10px",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: connected ? "#22c55e" : "#9ca3af",
        display: "inline-block",
        boxShadow: connected ? "0 0 0 2px #bbf7d0" : "none",
      }} />
      {connected ? "Temps réel actif" : "Déconnecté"}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 3000,
      background: "#1e293b", color: "#fff", borderRadius: 10,
      padding: "12px 20px", fontSize: 14, fontWeight: 600,
      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
    }}>
      {message}
    </div>
  );
}

// ─── Modal RDV ────────────────────────────────────────────────────────────────
function RdvModal({ rdv, employes, postes, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    date_rendezvous:  rdv?.date_rendezvous?.slice(0, 16) || "",
    type_service:     rdv?.type_service || "",
    statut:           rdv?.statut || "planifie",
    employe_id:       rdv?.employe_id || "",
    poste_travail_id: rdv?.poste_travail_id || "",
  });

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <h2 style={s.modalTitle}>{rdv ? "✏️ Modifier le RDV" : "➕ Nouveau RDV"}</h2>
        <div style={s.formGrid}>
          <div style={s.fg}>
            <label style={s.label}>Date & heure</label>
            <input style={s.input} type="datetime-local" name="date_rendezvous"
              value={form.date_rendezvous} onChange={handle} />
          </div>
          <div style={s.fg}>
            <label style={s.label}>Service</label>
            <input style={s.input} type="text" name="type_service"
              placeholder="Ex: vidange, freins…" value={form.type_service} onChange={handle} />
          </div>
          <div style={s.fg}>
            <label style={s.label}>Statut</label>
            <select style={s.input} name="statut" value={form.statut} onChange={handle}>
              {["planifie","confirme","en_cours","termine","annule"].map(st =>
                <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          <div style={s.fg}>
            <label style={s.label}>Employé assigné</label>
            <select style={s.input} name="employe_id" value={form.employe_id} onChange={handle}>
              <option value="">— Aucun —</option>
              {employes.map(e => (
                <option key={e.user_id} value={e.user_id}>{e.prenom} {e.nom}</option>
              ))}
            </select>
          </div>
          <div style={s.fg}>
            <label style={s.label}>Poste de travail</label>
            <select style={s.input} name="poste_travail_id" value={form.poste_travail_id} onChange={handle}>
              <option value="">— Aucun —</option>
              {postes.map(p => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={s.modalActions}>
          {rdv && (
            <button style={s.deleteBtn} onClick={() => onDelete(rdv.id)}>🗑️ Supprimer</button>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={s.cancelBtn} onClick={onClose}>Annuler</button>
            <button style={s.confirmBtn} onClick={() => onSave(form)}>
              {rdv ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function CalendrierRDV() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const authH    = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const [rdvList,   setRdvList]   = useState([]);
  const [employes,  setEmployes]  = useState([]);
  const [postes,    setPostes]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [menuOpen,  setMenuOpen]  = useState(true);
  const [modal,     setModal]     = useState(null);
  const [dragId,    setDragId]    = useState(null);
  const [conflicts, setConflicts] = useState(new Set());
  const [connected, setConnected] = useState(socket.connected);
  const [toast,     setToast]     = useState(null);

  // Ref pour accéder à rdvList dans les callbacks socket sans stale closure
  const rdvListRef = useRef([]);
  useEffect(() => { rdvListRef.current = rdvList; }, [rdvList]);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [rdvRes, empRes, posteRes] = await Promise.all([
        fetch(`${API_URL}/api/rendezvous/all`, { headers: authH }),
        fetch(`${API_URL}/api/auth/getUser`,   { headers: authH }),
        fetch(`${API_URL}/api/posteTravail`,   { headers: authH }),
      ]);
      const rdv   = rdvRes.ok   ? await rdvRes.json()   : [];
      const emp   = empRes.ok   ? await empRes.json()   : [];
      const poste = posteRes.ok ? await posteRes.json() : [];

      setRdvList(rdv);
      setEmployes(emp.filter(u => u.role === "employe"));
      setPostes(poste);
      setConflicts(detectConflicts(rdv));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Socket.IO ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return navigate("/", { replace: true });
    fetchAll();

    // Debug — log tous les events reçus
    const onAny = (event, ...args) => {
      console.log("🔌 SOCKET EVENT:", event, args);
    };

    const onConnect    = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onRdvCreate = (payload) => {
      console.log("📅 rdv:create reçu:", payload);
      const data = payload?.data || payload;
      setRdvList(prev => {
        const next = [...prev, data];
        setConflicts(detectConflicts(next));
        return next;
      });
      setToast("📅 Nouveau rendez-vous ajouté");
    };

    const onRdvUpdate = (payload) => {
      console.log("✏️ rdv:update reçu:", payload);
      const id   = payload?.id   || payload?.data?.id;
      const data = payload?.data || payload;
      setRdvList(prev => {
        const next = prev.map(r => r.id === id ? { ...r, ...data } : r);
        setConflicts(detectConflicts(next));
        return next;
      });
      setToast("✏️ Rendez-vous mis à jour");
    };

    const onRdvDelete = (payload) => {
      console.log("🗑️ rdv:delete reçu:", payload);
      // Gérer les deux structures possibles : { id } ou { id, data } ou { type, id, data }
      const id = payload?.id || payload?.data?.id;
      if (!id) {
        console.warn("rdv:delete — id introuvable dans le payload:", payload);
        return;
      }
      setRdvList(prev => {
        const next = prev.filter(r => r.id !== id);
        setConflicts(detectConflicts(next));
        return next;
      });
      setToast("🗑️ Rendez-vous supprimé");
    };

    socket.onAny(onAny);
    socket.on("connect",    onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("rdv:create", onRdvCreate);
    socket.on("rdv:update", onRdvUpdate);
    socket.on("rdv:delete", onRdvDelete);

    return () => {
      socket.offAny(onAny);
      socket.off("connect",    onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("rdv:create", onRdvCreate);
      socket.off("rdv:update", onRdvUpdate);
      socket.off("rdv:delete", onRdvDelete);
    };
  }, []);

  // ── Navigation mois ───────────────────────────────────────────────────────
  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };

  // ── RDV par jour ──────────────────────────────────────────────────────────
  const rdvByDay = {};
  rdvList.forEach(r => {
    const day = r.date_rendezvous?.slice(0, 10);
    if (!rdvByDay[day]) rdvByDay[day] = [];
    rdvByDay[day].push(r);
  });

  const cells = buildCalendarGrid(year, month);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    const isEdit = modal?.mode === "edit";
    const url    = isEdit
      ? `${API_URL}/api/rendezvous/${modal.rdv.id}/assigner`
      : `${API_URL}/api/rendezvous`;
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, { method, headers: authH, body: JSON.stringify(form) });
    if (res.ok) {
      setModal(null);
      // Pas de fetchAll — le socket met à jour automatiquement
    } else {
      const err = await res.json();
      alert(err.message || "Erreur");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce rendez-vous ?")) return;
    const res = await fetch(`${API_URL}/api/rendezvous/${id}`, {
      method: "DELETE", headers: authH
    });
    if (res.ok) {
      setModal(null);
      // Le socket émet rdv:delete → onRdvDelete retire le RDV de la liste
    } else {
      alert("Erreur lors de la suppression");
    }
  };

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  const handleDragStart = (e, rdvId) => {
    setDragId(rdvId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e, targetDate) => {
    e.preventDefault();
    if (!dragId) return;
    const rdv = rdvList.find(r => r.id === dragId);
    if (!rdv) return;

    const oldTime = rdv.date_rendezvous?.slice(11) || "09:00:00";
    const newDate = `${targetDate}T${oldTime}`;

    const sameDay = rdvList.filter(r =>
      r.id !== dragId && r.date_rendezvous?.slice(0,10) === targetDate
    );
    const hasConflict = sameDay.some(r =>
      (rdv.employe_id && r.employe_id === rdv.employe_id) ||
      (rdv.poste_travail_id && r.poste_travail_id === rdv.poste_travail_id)
    );

    if (hasConflict) {
      alert("⚠️ Conflit détecté : cet employé ou poste est déjà assigné ce jour-là !");
      setDragId(null);
      return;
    }

    await fetch(`${API_URL}/api/rendezvous/${dragId}/assigner`, {
      method: "PATCH",
      headers: authH,
      body: JSON.stringify({ ...rdv, date_rendezvous: newDate }),
    });
    setDragId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <Header onLogout={handleLogout} onToggleMenu={() => setMenuOpen(p => !p)} />

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <div style={s.layout}>
        {/* Sidebar */}
        <aside style={{ ...s.sidebar, width: menuOpen ? 220 : 0, padding: menuOpen ? "16px 12px" : 0 }}>
          {menuOpen && (
            <>
              <h3 style={s.sidebarTitle}>Navigation</h3>
              <ul style={s.menuList}>
                {[
                  ["🏠", "Tableau de bord", "/dashboard"],
                  ["📅", "Rendez-vous",     "/rendez-vous"],
                  ["✅", "Tâches",          "/gestion-taches"],
                  ["👥", "Utilisateurs",    "/utilisateurs"],
                  ["🛠️", "Services",        "/services"],
                  ["🚗", "Véhicules",       "/vehicules"],
                  ["🔔", "Notifications",   "/notifications"],
                  ["⚙️", "Paramètres",      "/parametres"],
                ].map(([icon, label, path]) => (
                  <li key={path} style={{
                    ...s.menuItem,
                    background: path === "/rendez-vous" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.03)",
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
              <h1 style={s.pageTitle}>📅 Calendrier des Rendez-vous</h1>
              <p style={s.pageSubtitle}>Vue mensuelle — glissez un RDV pour le déplacer</p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <LiveBadge connected={connected} />
              <button style={s.newBtn}
                onClick={() => setModal({ mode: "create", rdv: null, date: isoDate(now) })}>
                + Nouveau RDV
              </button>
            </div>
          </div>

          {conflicts.size > 0 && (
            <div style={s.conflictBanner}>
              ⚠️ {conflicts.size} rendez-vous en conflit détecté{conflicts.size > 1 ? "s" : ""} — vérifiez les cases orangées
            </div>
          )}

          <div style={s.monthNav}>
            <button style={s.navBtn} onClick={prevMonth}>‹</button>
            <span style={s.monthLabel}>{MOIS[month]} {year}</span>
            <button style={s.navBtn} onClick={nextMonth}>›</button>
          </div>

          {loading ? (
            <p style={{ padding: 20, color: "#6b7280" }}>Chargement...</p>
          ) : (
            <div style={s.calendarWrapper}>
              <div style={s.calGrid}>
                {JOURS.map(j => (
                  <div key={j} style={s.dayHeader}>{j}</div>
                ))}
                {cells.map((day, idx) => {
                  const dateStr = day
                    ? `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`
                    : null;
                  const dayRdv         = dateStr ? (rdvByDay[dateStr] || []) : [];
                  const isToday        = dateStr === isoDate(now);
                  const hasConflictDay = dayRdv.some(r => conflicts.has(r.id));

                  return (
                    <div
                      key={idx}
                      style={{
                        ...s.cell,
                        ...(day ? {} : s.emptyCell),
                        ...(isToday ? s.todayCell : {}),
                        ...(hasConflictDay ? s.conflictCell : {}),
                      }}
                      onDragOver={day ? (e) => e.preventDefault() : undefined}
                      onDrop={day ? (e) => handleDrop(e, dateStr) : undefined}
                      onClick={() => day && setModal({ mode: "create", rdv: null, date: dateStr })}
                    >
                      {day && (
                        <>
                          <span style={{ ...s.dayNum, ...(isToday ? s.todayNum : {}) }}>{day}</span>
                          <div style={s.rdvList}>
                            {dayRdv.map(rdv => {
                              const col        = STATUT_COLORS[rdv.statut] || STATUT_COLORS.planifie;
                              const isConflict = conflicts.has(rdv.id);
                              return (
                                <div
                                  key={rdv.id}
                                  draggable
                                  onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, rdv.id); }}
                                  onClick={(e) => { e.stopPropagation(); setModal({ mode: "edit", rdv }); }}
                                  style={{
                                    ...s.rdvChip,
                                    background: isConflict ? "#fff3cd" : col.bg,
                                    borderLeft: `3px solid ${isConflict ? "#f59e0b" : col.border}`,
                                    color:      isConflict ? "#92400e" : col.text,
                                  }}
                                  title={`${rdv.type_service} — ${rdv.statut}`}
                                >
                                  <span style={s.chipTime}>{rdv.date_rendezvous?.slice(11,16)}</span>
                                  <span style={s.chipService}>
                                    {rdv.vehicules?.marque} {rdv.vehicules?.modele}
                                  </span>
                                  {isConflict && <span>⚠️</span>}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={s.legend}>
            {Object.entries(STATUT_COLORS).map(([st, col]) => (
              <div key={st} style={s.legendItem}>
                <span style={{ ...s.legendDot, background: col.border }} />
                {st}
              </div>
            ))}
            <div style={s.legendItem}>
              <span style={{ ...s.legendDot, background: "#f59e0b" }} />
              conflit
            </div>
          </div>
        </main>
      </div>

      {modal && (
        <RdvModal
          rdv={modal.rdv}
          employes={employes}
          postes={postes}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", width: "100%", background: "#f0f4f8", fontFamily: "'Segoe UI',sans-serif", boxSizing: "border-box", overflowX: "hidden" },
  layout: { display: "flex", minHeight: "calc(100vh - 70px)", width: "100%" },
  sidebar: { background: "#111827", color: "#fff", overflow: "hidden", transition: "all 0.25s ease", flexShrink: 0 },
  sidebarTitle: { margin: "0 0 12px", fontSize: 16, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 8 },
  menuList: { listStyle: "none", padding: 0, margin: 0 },
  menuItem: { padding: 10, borderRadius: 8, cursor: "pointer", marginBottom: 6, fontSize: 14, transition: "0.2s" },
  main: { flex: 1, padding: 20, minWidth: 0, boxSizing: "border-box" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 },
  pageTitle: { margin: 0, fontSize: 24, color: "#0f172a" },
  pageSubtitle: { margin: "4px 0 0", color: "#6b7280", fontSize: 13 },
  newBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },
  conflictBanner: { background: "#fff3cd", border: "1px solid #f59e0b", color: "#92400e", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 14, fontWeight: 600 },
  monthNav: { display: "flex", alignItems: "center", gap: 16, marginBottom: 14, justifyContent: "center" },
  navBtn: { background: "#fff", border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 18, color: "#374151" },
  monthLabel: { fontSize: 20, fontWeight: 700, color: "#0f172a", minWidth: 200, textAlign: "center" },
  calendarWrapper: { background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb", overflow: "hidden" },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)" },
  dayHeader: { padding: "10px 0", textAlign: "center", fontWeight: 700, fontSize: 13, color: "#6b7280", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" },
  cell: { minHeight: 110, borderRight: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6", padding: "6px 5px", cursor: "pointer", transition: "background 0.15s", position: "relative" },
  emptyCell: { background: "#fafafa", cursor: "default" },
  todayCell: { background: "#eff6ff" },
  conflictCell: { background: "#fffbeb" },
  dayNum: { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 },
  todayNum: { background: "#2563eb", color: "#fff", borderRadius: "50%", width: 24, height: 24, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 },
  rdvList: { display: "flex", flexDirection: "column", gap: 3 },
  rdvChip: { borderRadius: 5, padding: "3px 6px", fontSize: 11, cursor: "grab", display: "flex", alignItems: "center", gap: 4, overflow: "hidden" },
  chipTime: { fontWeight: 700, flexShrink: 0 },
  chipService: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 },
  legend: { display: "flex", gap: 16, marginTop: 14, flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" },
  legendDot: { width: 10, height: 10, borderRadius: "50%", display: "inline-block" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 },
  modal: { background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 520, boxShadow: "0 20px 50px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { margin: "0 0 18px", fontSize: 20, color: "#0f172a" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  fg: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: { padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  modalActions: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22 },
  deleteBtn: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "9px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  cancelBtn: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  confirmBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },
};