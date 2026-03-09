/// Pages de mes taches pour montrer chaque employe ses taches asignnes 

import React, { useEffect, useState, useRef } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001";

const URGENCE_CONFIG = {
  haute:    { label: "Haute",    bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", order: 0 },
  moyenne:  { label: "Moyenne",  bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", order: 1 },
  basse:    { label: "Basse",    bg: "#d1fae5", color: "#065f46", dot: "#10b981", order: 2 },
};

const STATUT_CONFIG = {
  attribue: { label: "Attribué",  bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  en_cours: { label: "En cours",  bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  termine:  { label: "Terminé",   bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" },
};

// ── Chrono ──────────────────────────────────────────────────────────────────
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
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  return { elapsed, format: format(elapsed), reset };
}

// ── Carte tâche ──────────────────────────────────────────────────────────────
function TacheCard({ tache, onDemarrer, onTerminer, activeId }) {
  const isActive  = activeId === tache.id;
  const chrono    = useChronometer(isActive);
  const urgence   = URGENCE_CONFIG[tache.niveau_urgence] || URGENCE_CONFIG.moyenne;
  const statut    = STATUT_CONFIG[tache.statut] || STATUT_CONFIG.attribue;
  const isTermine = tache.statut === "termine";

  return (
    <div style={{
      ...s.card,
      borderLeft: `4px solid ${urgence.dot}`,
      opacity: isTermine ? 0.7 : 1,
    }}>
      {/* Header */}
      <div style={s.cardHeader}>
        <div style={{ flex: 1 }}>
          <div style={s.cardMeta}>
            <span style={{ ...s.badge, background: urgence.bg, color: urgence.color }}>
              ● {urgence.label}
            </span>
            <span style={{ ...s.badge, background: statut.bg, color: statut.color }}>
              ● {statut.label}
            </span>
          </div>
          <h3 style={s.cardTitle}>{tache.titre}</h3>
        </div>
      </div>

      {/* Description */}
      {tache.description && (
        <p style={s.cardDesc}>{tache.description}</p>
      )}

      {/* Infos */}
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
            <span style={s.infoValue}>
              {new Date(tache.created_at).toLocaleDateString("fr-CA")}
            </span>
          </div>
        )}
      </div>

      {/* Chrono actif */}
      {isActive && (
        <div style={s.chronoBox}>
          <span style={s.chronoIcon}>⏱️</span>
          <span style={s.chronoTime}>{chrono.format}</span>
          <span style={s.chronoLabel}>en cours</span>
        </div>
      )}

      {/* Actions */}
      {!isTermine && (
        <div style={s.cardActions}>
          {tache.statut === "attribue" && (
            <button
              style={s.btnDemarrer}
              onClick={() => { chrono.reset(); onDemarrer(tache.id); }}
            >
              ▶️ Démarrer
            </button>
          )}
          {tache.statut === "en_cours" && (
            <button
              style={s.btnTerminer}
              onClick={() => onTerminer(tache)}
            >
              🏁 Terminer
            </button>

            // En cada tarjeta/fila de tâche
          )}
        </div>
      )}
    </div>
    
  );
}

// ── Modal terminer ────────────────────────────────────────────────────────────
function ModalTerminer({ tache, onConfirm, onClose }) {
  const [commentaires, setCommentaires] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <h2 style={s.modalTitle}>🏁 Terminer la tâche</h2>
        <p style={{ color: "#374151", marginBottom: 16, fontSize: 14 }}>
          <strong>{tache.titre}</strong> — ajoutez un commentaire optionnel avant de terminer.
        </p>
        <textarea
          style={s.textarea}
          placeholder="Commentaire de fin de tâche (optionnel)..."
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
            {loading ? "..." : "🏁 Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────
export default function MesTaches() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const authH    = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const [taches,    setTaches]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [menuOpen,  setMenuOpen]  = useState(true);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [activeId,  setActiveId]  = useState(null); // tâche en cours (chrono)
  const [modalTache, setModalTache] = useState(null);

  // Filtres
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
      const res = await fetch(`${API_URL}/api/taches`, { headers: authH });
      const data = res.ok ? await res.json() : [];
      setTaches(data);
    } catch (e) {
      setError("Impossible de charger les tâches.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemarrer = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/taches/${id}`, {
        method: "PUT",
        headers: authH,
        body: JSON.stringify({
          statut: "en_cours",
          heure_debut: new Date().toTimeString().slice(0, 8),
        }),
      });
      if (!res.ok) throw new Error("Erreur");
      setActiveId(id);
      setSuccess("Tâche démarrée ✅");
      setTimeout(() => setSuccess(""), 3000);
      fetchTaches();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleTerminer = async (id, commentaires) => {
    try {
      const res = await fetch(`${API_URL}/api/taches/terminer`, {
        method: "POST",
        headers: authH,
        body: JSON.stringify({ id, commentaires }),
      });
      if (!res.ok) throw new Error("Erreur");
      setActiveId(null);
      setModalTache(null);
      setSuccess("Tâche terminée 🏁");
      setTimeout(() => setSuccess(""), 3000);
      fetchTaches();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  // Filtrage + tri
  const filtered = taches
    .filter(t => filterStatut  === "tous" || t.statut         === filterStatut)
    .filter(t => filterUrgence === "tous" || t.niveau_urgence === filterUrgence)
    .filter(t => !search || t.titre?.toLowerCase().includes(search.toLowerCase())
                         || t.description?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const oa = URGENCE_CONFIG[a.niveau_urgence]?.order ?? 99;
      const ob = URGENCE_CONFIG[b.niveau_urgence]?.order ?? 99;
      return oa - ob;
    });

  // Stats
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
                  ["🏠", "Mon dashboard",   "/dashboard-employe"],
                  ["✅", "Mes tâches",       "/taches"],
                  ["📅", "Mes rendez-vous",  "/mes-rendez-vous"],
                  ["🔔", "Notifications",    "/notifications"],
                  ["👤", "Mon profil",       "/profil"],
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

        {/* Main */}
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
              <option value="haute">Haute</option>
              <option value="moyenne">Moyenne</option>
              <option value="basse">Basse</option>
            </select>
          </div>

          {/* Liste */}
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
                  onDemarrer={handleDemarrer}
                  onTerminer={(t) => setModalTache(t)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

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

// En cada tarjeta/fila de tâche
<button onClick={() => navigate(`/taches/${tache.id}/commentaires`)}>
  💬 Commentaires
</button>

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
  cardActions: { display: "flex", gap: 8, marginTop: 14 },
  btnDemarrer: { flex: 1, background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd", padding: "9px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
  btnTerminer: { flex: 1, background: "#2563eb", color: "#fff", border: "none", padding: "9px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
  emptyState: { textAlign: "center", padding: "60px 20px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 },
  modal: { background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 460, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" },
  modalTitle: { margin: "0 0 12px", fontSize: 20, color: "#0f172a" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 },
  cancelBtn: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  textarea: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" },
};