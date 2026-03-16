import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;


const STATUT_CONFIG = {
  planifie:  { label: "Planifié",  bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  confirme:  { label: "Confirmé", bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  termine:   { label: "Terminé",  bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" },
  annule:    { label: "Annulé",   bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

const FILTERS = ["tous", "planifie", "confirme", "termine", "annule"];

function StatutBadge({ statut }) {
  const cfg = STATUT_CONFIG[statut] || STATUT_CONFIG.planifie;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.color,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

function RdvCard({ rdv, onUpdateStatut }) {
  const date = rdv.date_rendezvous
    ? new Date(rdv.date_rendezvous).toLocaleDateString("fr-CA", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      })
    : "—";
  const heure = rdv.heure_debut
    ? `${rdv.heure_debut} — ${rdv.heure_fin || "?"}`
    : rdv.date_rendezvous?.slice(11, 16) || "—";

  const vehicule = rdv.vehicules
    ? `${rdv.vehicules.marque || ""} ${rdv.vehicules.modele || ""}`.trim()
    : "—";

  const client = rdv.vehicules?.utilisateurs
    ? `${rdv.vehicules.utilisateurs.prenom || ""} ${rdv.vehicules.utilisateurs.nom || ""}`.trim()
    : "—";

  return (
    <div style={styles.card}>
      {/* Top strip by statut */}
      <div style={{
        height: 4, borderRadius: "10px 10px 0 0",
        background: STATUT_CONFIG[rdv.statut]?.dot || "#3b82f6",
        margin: "-16px -16px 14px -16px",
      }} />

      <div style={styles.cardHeader}>
        <div>
          <p style={styles.cardDate}>{date}</p>
          <p style={styles.cardHeure}>🕐 {heure}</p>
        </div>
        <StatutBadge statut={rdv.statut} />
      </div>

      <div style={styles.cardGrid}>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>👤 Client</span>
          <span style={styles.infoValue}>{client}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>🚗 Véhicule</span>
          <span style={styles.infoValue}>{vehicule}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>🔑 Plaque</span>
          <span style={styles.infoValue}>{rdv.vehicules?.plaque || "—"}</span>
        </div>
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>🛠️ Service</span>
          <span style={styles.infoValue}>{rdv.type_service || "—"}</span>
        </div>
        {rdv.poste_travail_id && (
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>🔧 Poste</span>
            <span style={styles.infoValue}>{rdv.poste_travail_id}</span>
          </div>
        )}
      </div>

      {rdv.commentaires && (
        <div style={styles.commentBox}>
          <span style={styles.infoLabel}>💬 Commentaire client</span>
          <p style={styles.commentText}>{rdv.commentaires}</p>
        </div>
      )}

      {/* Actions statut — employe peut marquer en cours ou terminé */}
      {rdv.statut !== "annule" && rdv.statut !== "termine" && (
        <div style={styles.cardActions}>
          {rdv.statut === "planifie" && (
            <button
              style={styles.btnConfirm}
              onClick={() => onUpdateStatut(rdv.id, "confirme")}
            >
              ✅ Confirmer ma présence
            </button>
          )}
          {rdv.statut === "confirme" && (
            <button
              style={styles.btnTermine}
              onClick={() => onUpdateStatut(rdv.id, "termine")}
            >
              🏁 Marquer comme terminé
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function MesRendezVousEmploye() {
  const navigate  = useNavigate();
  const token     = localStorage.getItem("token");
  const authH     = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const [user,      setUser]      = useState(null);
  const [rdvList,   setRdvList]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [menuOpen,  setMenuOpen]  = useState(true);
  const [filter,    setFilter]    = useState("tous");
  const [search,    setSearch]    = useState("");
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  useEffect(() => {
    if (!token) return navigate("/", { replace: true });
    init();
  }, []);

  const init = async () => {
    setLoading(true);
    try {
      // Obtener perfil del empleado
      const meRes = await fetch(`${API_URL}/api/auth/me`, { headers: authH });
      const me = meRes.ok ? await meRes.json() : null;
      setUser(me);

      // ─── NOTE ──────────────────────────────────────────────────────────────
      // Cuando la colonne employe_id sea agregada a rendez_vous en Supabase,
      // cambiar esta URL a:
      //   /api/rendezvous/mes-rdv   (nuevo endpoint que filtre por employe_id)
      // Por ahora usamos /all para mostrar todos los RDV del garage.
      // ───────────────────────────────────────────────────────────────────────
      const rdvRes = await fetch(`${API_URL}/api/rendezvous/all`, { headers: authH });
      const rdv = rdvRes.ok ? await rdvRes.json() : [];
      setRdvList(rdv);
    } catch (e) {
      setError("Impossible de charger les rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatut = async (id, newStatut) => {
    try {
      const res = await fetch(`${API_URL}/api/rendezvous/${id}`, {
        method: "PUT",
        headers: authH,
        body: JSON.stringify({ statut: newStatut }),
      });
      if (!res.ok) throw new Error("Erreur mise à jour");
      setSuccess(`Statut mis à jour : ${newStatut}`);
      setTimeout(() => setSuccess(""), 3000);
      init();
    } catch (e) {
      setError(e.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  // Filtrage
  const filtered = rdvList.filter(r => {
    const matchFilter = filter === "tous" || r.statut === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || r.type_service?.toLowerCase().includes(q)
      || r.vehicules?.marque?.toLowerCase().includes(q)
      || r.vehicules?.modele?.toLowerCase().includes(q)
      || r.vehicules?.plaque?.toLowerCase().includes(q)
      || r.commentaires?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // Grouper par date
  const grouped = {};
  filtered.forEach(r => {
    const day = r.date_rendezvous?.slice(0, 10) || "Sans date";
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(r);
  });
  const sortedDays = Object.keys(grouped).sort();

  const formatGroupDate = (dateStr) => {
    if (dateStr === "Sans date") return "📅 Sans date";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  // Stats rapides
  const counts = { planifie: 0, confirme: 0, termine: 0, annule: 0 };
  rdvList.forEach(r => { if (counts[r.statut] !== undefined) counts[r.statut]++; });

  return (
    <div style={styles.page}>
      <Header onLogout={handleLogout} onToggleMenu={() => setMenuOpen(p => !p)} />

      <div style={styles.layout}>
        {/* Sidebar */}
        <aside style={{ ...styles.sidebar, width: menuOpen ? 220 : 0, padding: menuOpen ? "16px 12px" : 0 }}>
          {menuOpen && (
            <>
              <h3 style={styles.sidebarTitle}>Navigation</h3>
              <ul style={styles.menuList}>
                {[
                  ["🏠", "Mon dashboard",   "/dashboard-employe"],
                  ["✅", "Mes tâches",       "/taches"],
                  ["📅", "Mes rendez-vous",  "/rendez-vous"],
                  ["🔔", "Notifications",    "/notifications"],
                  ["👤", "Mon profil",       "/profil"],
                ].map(([icon, label, path]) => (
                  <li key={path} style={{
                    ...styles.menuItem,
                    background: path === "/rendez-vous"
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
        <main style={styles.main}>
          {/* Header */}
          <div style={styles.topBar}>
            <div>
              <h1 style={styles.pageTitle}>📅 Mes Rendez-vous</h1>
              <p style={styles.pageSubtitle}>
                Bonjour {user?.prenom} — voici vos interventions planifiées
              </p>
            </div>
          </div>

          {/* Alerts */}
          {error   && <div style={styles.alertError}>{error}</div>}
          {success && <div style={styles.alertSuccess}>{success}</div>}

          {/* Stats rapides */}
          <div style={styles.statsRow}>
            {[
              { label: "Planifiés",  count: counts.planifie,  color: "#3b82f6" },
              { label: "Confirmés",  count: counts.confirme,  color: "#10b981" },
              { label: "Terminés",   count: counts.termine,   color: "#9ca3af" },
              { label: "Annulés",    count: counts.annule,    color: "#ef4444" },
            ].map(({ label, count, color }) => (
              <div key={label} style={styles.statCard}>
                <span style={{ ...styles.statDot, background: color }} />
                <span style={styles.statCount}>{count}</span>
                <span style={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>

          {/* Filters + Search */}
          <div style={styles.toolbar}>
            <div style={styles.filterTabs}>
              {FILTERS.map(f => (
                <button key={f} style={{
                  ...styles.filterTab,
                  ...(filter === f ? styles.filterTabActive : {}),
                }} onClick={() => setFilter(f)}>
                  {f === "tous" ? "Tous" : STATUT_CONFIG[f]?.label}
                </button>
              ))}
            </div>
            <input
              style={styles.searchInput}
              placeholder="🔍 Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Liste groupée par date */}
          {loading ? (
            <p style={{ color: "#6b7280", padding: 20 }}>Chargement...</p>
          ) : sortedDays.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 40 }}>📭</p>
              <p style={{ color: "#6b7280" }}>Aucun rendez-vous trouvé</p>
            </div>
          ) : (
            sortedDays.map(day => (
              <div key={day} style={styles.dayGroup}>
                <h3 style={styles.dayLabel}>{formatGroupDate(day)}</h3>
                <div style={styles.cardList}>
                  {grouped[day].map(rdv => (
                    <RdvCard key={rdv.id} rdv={rdv} onUpdateStatut={handleUpdateStatut} />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Note technique */}
          <div style={styles.noteBox}>
            ℹ️ <strong>Note :</strong> Cette page affiche actuellement tous les RDV du garage.
            Lorsque la colonne <code>employe_id</code> sera ajoutée à la table <code>rendez_vous</code>,
            seuls vos RDV assignés seront affichés automatiquement.
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
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
  statsRow: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" },
  statCard: { background: "#fff", borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb", minWidth: 130 },
  statDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  statCount: { fontSize: 22, fontWeight: 800, color: "#0f172a" },
  statLabel: { fontSize: 13, color: "#6b7280" },
  toolbar: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
  filterTabs: { display: "flex", gap: 6, flexWrap: "wrap" },
  filterTab: { background: "#fff", border: "1px solid #d1d5db", color: "#374151", padding: "7px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "0.15s" },
  filterTabActive: { background: "#2563eb", color: "#fff", border: "1px solid #2563eb", fontWeight: 700 },
  searchInput: { flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none" },
  dayGroup: { marginBottom: 24 },
  dayLabel: { fontSize: 15, fontWeight: 700, color: "#374151", margin: "0 0 10px", textTransform: "capitalize" },
  cardList: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 },
  card: { background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb", overflow: "hidden" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 8 },
  cardDate: { margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a", textTransform: "capitalize" },
  cardHeure: { margin: "3px 0 0", fontSize: 13, color: "#6b7280" },
  cardGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 },
  infoItem: { display: "flex", flexDirection: "column", gap: 2 },
  infoLabel: { fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
  infoValue: { fontSize: 13, color: "#1f2937", fontWeight: 500 },
  commentBox: { background: "#f9fafb", borderRadius: 8, padding: "10px 12px", marginTop: 8, borderLeft: "3px solid #e5e7eb" },
  commentText: { margin: "4px 0 0", fontSize: 13, color: "#374151", lineHeight: 1.5 },
  cardActions: { marginTop: 14, display: "flex", gap: 8 },
  btnConfirm: { flex: 1, background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
  btnTermine: { flex: 1, background: "#dbeafe", color: "#1e40af", border: "1px solid #93c5fd", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
  emptyState: { textAlign: "center", padding: "60px 20px", color: "#9ca3af" },
  noteBox: { marginTop: 24, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#92400e", lineHeight: 1.6 },
};