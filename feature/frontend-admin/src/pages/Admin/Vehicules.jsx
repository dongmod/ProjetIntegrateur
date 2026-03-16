import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;


const STATUT_FACTURE = {
  payee:      { label: "Payée",      bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
  impayee:    { label: "Impayée",    bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  en_attente: { label: "En attente", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
};

function marqueColor(marque) {
  const colors = {
    Toyota: "#ef4444", Honda: "#dc2626", BMW: "#1e293b", Mercedes: "#334155",
    Ford: "#1d4ed8", Chevrolet: "#b45309", Audi: "#111827", Volkswagen: "#1e40af",
    Hyundai: "#1e3a5f", Nissan: "#7f1d1d", Kia: "#0c2340", Mazda: "#7f0000",
    Subaru: "#1e3a5c", Jeep: "#2d4a1e", Ram: "#1b2a4a",
  };
  return colors[marque] || "#4b5563";
}

// ─── Modal détail ─────────────────────────────────────────────────────────────
function ModalVehicule({ vehicule, client, onClose, token }) {
  const [historique, setHistorique] = useState([]);
  const [factures,   setFactures]   = useState([]);
  const [loadH, setLoadH] = useState(true);
  const [loadF, setLoadF] = useState(true);
  const [tab, setTab] = useState("info");

  const authH = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API_URL}/api/vehicules/${vehicule.id}/historique`, { headers: authH })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setHistorique(Array.isArray(d) ? d : []); setLoadH(false); })
      .catch(() => setLoadH(false));

    fetch(`${API_URL}/api/factures/getfacturesall`, { headers: authH })
      .then(r => r.ok ? r.json() : [])
      .then(d => {
        const filtered = Array.isArray(d) ? d.filter(f => f.client_id === vehicule.client_id) : [];
        setFactures(filtered);
        setLoadF(false);
      })
      .catch(() => setLoadF(false));
  }, []);

  const totalPaye   = factures.filter(f => f.statut === "payee").reduce((s, f) => s + (f.total || 0), 0);
  const totalImpaye = factures.filter(f => f.statut === "impayee").reduce((s, f) => s + (f.total || 0), 0);
  const initiales   = client ? `${client.prenom?.[0] || ""}${client.nom?.[0] || ""}`.toUpperCase() : "?";

  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.modal} onClick={e => e.stopPropagation()}>

        {/* Banner marque */}
        <div style={{ ...m.banner, background: marqueColor(vehicule.marque) }}>
          <div>
            <h2 style={m.bannerTitle}>{vehicule.marque} {vehicule.modele}</h2>
            <span style={m.bannerPlate}>{vehicule.plaque}</span>
          </div>
          <button onClick={onClose} style={m.closeBtn}>✕</button>
        </div>

        {/* Stats rapides */}
        <div style={m.statsRow}>
          <div style={m.statBox}>
            <span style={m.statNum}>{factures.length}</span>
            <span style={m.statLab}>Factures</span>
          </div>
          <div style={{ ...m.statBox, borderColor: "#10b981" }}>
            <span style={{ ...m.statNum, color: "#10b981" }}>{totalPaye.toFixed(2)} $</span>
            <span style={m.statLab}>Payé</span>
          </div>
          <div style={{ ...m.statBox, borderColor: "#ef4444" }}>
            <span style={{ ...m.statNum, color: "#ef4444" }}>{totalImpaye.toFixed(2)} $</span>
            <span style={m.statLab}>Impayé</span>
          </div>
          <div style={{ ...m.statBox, borderColor: "#f59e0b" }}>
            <span style={m.statNum}>{historique.length}</span>
            <span style={m.statLab}>Interventions</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={m.tabs}>
          {[
            ["info",       "🚗 Véhicule"],
            ["proprietaire", "👤 Propriétaire"],
            ["historique", "📋 Historique"],
            ["factures",   "🧾 Factures"],
          ].map(([key, label]) => (
            <button key={key}
              style={{ ...m.tab, ...(tab === key ? m.tabActive : {}) }}
              onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div style={m.tabContent}>

          {/* Tab info véhicule */}
          {tab === "info" && (
            <div style={m.infoGrid}>
              {[
                ["🏷️ Marque",          vehicule.marque],
                ["🚘 Modèle",          vehicule.modele],
                ["📅 Année",           vehicule.annee],
                ["🎨 Couleur",         vehicule.couleur],
                ["📍 Immatriculation", vehicule.immatriculation],
                ["🔢 VIN",             vehicule.vin],
                ["📏 Kilométrage",     vehicule.kilometrage ? `${Number(vehicule.kilometrage).toLocaleString()} km` : "—"],
                ["🛠️ Dernière maint.", vehicule.date_derniere_maint
                  ? new Date(vehicule.date_derniere_maint).toLocaleDateString("fr-CA") : "—"],
              ].filter(([, v]) => v).map(([label, val]) => (
                <div key={label} style={m.infoItem}>
                  <span style={m.infoLabel}>{label}</span>
                  <span style={m.infoVal}>{val || "—"}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tab propriétaire */}
          {tab === "proprietaire" && (
            client ? (
              <div>
                <div style={m.ownerCard}>
                  <div style={m.ownerAvatarLg}>{initiales}</div>
                  <div>
                    <h3 style={{ margin: "0 0 4px", fontSize: 20, color: "#0f172a" }}>
                      {client.prenom} {client.nom}
                    </h3>
                    <span style={{ ...m.roleBadge }}>
                      {client.role}
                    </span>
                  </div>
                </div>
                <div style={m.infoGrid}>
                  {[
                    ["📧 Email",  client.email],
                    ["🆔 ID",     client.user_id?.slice(0, 8) + "…"],
                  ].map(([label, val]) => (
                    <div key={label} style={m.infoItem}>
                      <span style={m.infoLabel}>{label}</span>
                      <span style={m.infoVal}>{val || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={m.empty}>Propriétaire introuvable.</p>
            )
          )}

          {/* Tab historique */}
          {tab === "historique" && (
            loadH ? <p style={m.loading}>Chargement...</p>
            : historique.length === 0
              ? <p style={m.empty}>Aucune intervention terminée.</p>
              : historique.map(rdv => (
                <div key={rdv.id} style={m.rdvCard}>
                  <div style={m.rdvTop}>
                    <span style={m.rdvService}>{rdv.type_service || "Service"}</span>
                    <span style={m.rdvDate}>{new Date(rdv.date_rendezvous).toLocaleDateString("fr-CA")}</span>
                  </div>
                  {rdv.commentaires && <p style={m.rdvComment}>💬 {rdv.commentaires}</p>}
                  {rdv.taches?.length > 0 && (
                    <div style={m.tachesList}>
                      {rdv.taches.map((t, i) => (
                        <div key={i} style={m.tacheItem}>
                          <span style={{ color: "#2563eb" }}>▸</span>
                          <span>{t.titre}</span>
                          {t.heure_debut && t.heure_fin && (
                            <span style={{ marginLeft: "auto", color: "#9ca3af", fontFamily: "monospace", fontSize: 11 }}>
                              {t.heure_debut?.slice(0,5)} → {t.heure_fin?.slice(0,5)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
          )}

          {/* Tab factures */}
          {tab === "factures" && (
            loadF ? <p style={m.loading}>Chargement...</p>
            : factures.length === 0
              ? <p style={m.empty}>Aucune facture trouvée.</p>
              : factures.map(f => {
                const st = STATUT_FACTURE[f.statut] || STATUT_FACTURE.en_attente;
                return (
                  <div key={f.id} style={m.factureCard}>
                    <div style={m.factureTop}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={m.factureNum}>#{f.numero || f.id?.slice(0,8)}</span>
                        <span style={{ ...m.statutBadge, background: st.bg, color: st.color }}>
                          <span style={{ color: st.dot }}>●</span> {st.label}
                        </span>
                      </div>
                      <span style={m.factureTotal}>{(f.total || 0).toFixed(2)} $</span>
                    </div>
                    <span style={m.factureDate}>
                      Émise le {f.date_emission ? new Date(f.date_emission).toLocaleDateString("fr-CA") : "—"}
                    </span>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Vehicules() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const authH    = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const [vehicules,    setVehicules]    = useState([]);
  const [clients,      setClients]      = useState({});
  const [loading,      setLoading]      = useState(true);
  const [menuOpen,     setMenuOpen]     = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterMarque, setFilterMarque] = useState("tous");
  const [selected,     setSelected]     = useState(null);

  useEffect(() => {
    if (!token) return navigate("/", { replace: true });
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, uRes] = await Promise.all([
        fetch(`${API_URL}/api/vehicules/getVehiculeall`, { headers: authH }),
        fetch(`${API_URL}/api/auth/getUser`, { headers: authH }),
      ]);
      const vData = vRes.ok ? await vRes.json() : [];
      const uData = uRes.ok ? await uRes.json() : [];

      setVehicules(Array.isArray(vData) ? vData : []);
      const map = {};
      (Array.isArray(uData) ? uData : []).forEach(u => { map[u.user_id] = u; });
      setClients(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const marques = ["tous", ...new Set(vehicules.map(v => v.marque).filter(Boolean))];

  const filtered = vehicules
    .filter(v => filterMarque === "tous" || v.marque === filterMarque)
    .filter(v => {
      const q = search.toLowerCase();
      const c = clients[v.client_id];
      return (
        v.marque?.toLowerCase().includes(q) ||
        v.modele?.toLowerCase().includes(q) ||
        v.plaque?.toLowerCase().includes(q) ||
        v.vin?.toLowerCase().includes(q) ||
        c?.nom?.toLowerCase().includes(q) ||
        c?.prenom?.toLowerCase().includes(q) ||
        c?.email?.toLowerCase().includes(q)
      );
    });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <div style={s.page}>
      <Header onLogout={handleLogout} onToggleMenu={() => setMenuOpen(p => !p)} />

      <div style={s.layout}>
        {/* Sidebar */}
        <aside style={{ ...s.sidebar, width: menuOpen ? 240 : 0, padding: menuOpen ? "16px 12px" : 0 }}>
          {menuOpen && (
            <>
              <h3 style={s.sidebarTitle}>Navigation</h3>
              <ul style={s.menuList}>
                {[
                  ["🏠", "Tableau de bord",  "/dashboard"],
                  ["📅", "Rendez-vous",      "/rendez-vous"],
                  ["✅", "Gestion tâches",   "/gestion-taches"],
                  ["👥", "Utilisateurs",     "/utilisateurs"],
                  ["🛠️", "Services",         "/services"],
                  ["🚗", "Véhicules",        "/vehicules"],
                  ["🔔", "Notifications",    "/notifications"],
                  ["⚙️", "Paramètres",       "/parametres"],
                ].map(([icon, label, path]) => (
                  <li key={path} style={{
                    ...s.menuItem,
                    background: path === "/vehicules" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.03)",
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
          <div style={s.pageHeader}>
            <div>
              <h1 style={s.pageTitle}>🚗 Véhicules</h1>
              <p style={s.pageSubtitle}>Liste des véhicules, propriétaires et historique de service</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={s.chip}>🚗 {vehicules.length} véhicules</span>
              <span style={s.chip}>👤 {new Set(vehicules.map(v => v.client_id)).size} clients</span>
            </div>
          </div>

          {/* Toolbar */}
          <div style={s.toolbar}>
            <input
              style={s.searchInput}
              placeholder="🔍 Rechercher par marque, plaque, VIN, client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select style={s.select} value={filterMarque} onChange={e => setFilterMarque(e.target.value)}>
              {marques.map(mk => (
                <option key={mk} value={mk}>{mk === "tous" ? "Toutes marques" : mk}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <p style={{ color: "#6b7280", padding: 20 }}>Chargement...</p>
          ) : filtered.length === 0 ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 48 }}>🚗</p>
              <p style={{ color: "#6b7280" }}>Aucun véhicule trouvé</p>
            </div>
          ) : (
            <div style={s.tableWrapper}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["Véhicule", "Plaque", "Année", "Kilométrage", "Propriétaire", "Dernière maint.", "Actions"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(v => {
                    const client    = clients[v.client_id];
                    const initiales = client
                      ? `${client.prenom?.[0] || ""}${client.nom?.[0] || ""}`.toUpperCase()
                      : "?";
                    const color = marqueColor(v.marque);

                    return (
                      <tr key={v.id} style={s.tr}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                      >
                        {/* Véhicule */}
                        <td style={s.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ ...s.marqueBadge, background: color }}>
                              {v.marque?.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                                {v.marque} {v.modele}
                              </div>
                              {v.couleur && (
                                <div style={{ fontSize: 11, color: "#9ca3af" }}>{v.couleur}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Plaque */}
                        <td style={s.td}>
                          <span style={s.plateTag}>{v.plaque}</span>
                        </td>

                        {/* Année */}
                        <td style={{ ...s.td, color: "#374151" }}>{v.annee || "—"}</td>

                        {/* Kilométrage */}
                        <td style={s.td}>
                          {v.kilometrage
                            ? <span style={s.kmTag}>{Number(v.kilometrage).toLocaleString()} km</span>
                            : <span style={{ color: "#d1d5db" }}>—</span>}
                        </td>

                        {/* Propriétaire */}
                        <td style={s.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={s.avatar}>{initiales}</div>
                            <div>
                              {client ? (
                                <>
                                  <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>
                                    {client.prenom} {client.nom}
                                  </div>
                                  <div style={{ fontSize: 11, color: "#6b7280" }}>{client.email}</div>
                                </>
                              ) : (
                                <span style={{ color: "#d1d5db", fontSize: 13 }}>Inconnu</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Dernière maintenance */}
                        <td style={s.td}>
                          {v.date_derniere_maint ? (
                            <span style={s.maintTag}>
                              🛠️ {new Date(v.date_derniere_maint).toLocaleDateString("fr-CA")}
                            </span>
                          ) : (
                            <span style={{ color: "#d1d5db", fontSize: 13 }}>—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td style={s.td}>
                          <button
                            style={s.detailBtn}
                            onClick={() => setSelected({ vehicule: v, client })}
                          >
                            🔍 Détails
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {selected && (
        <ModalVehicule
          vehicule={selected.vehicule}
          client={selected.client}
          token={token}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// ─── Styles page ──────────────────────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", width: "100%", background: "#f0f4f8", fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box", overflowX: "hidden" },
  layout: { display: "flex", minHeight: "calc(100vh - 70px)" },
  sidebar: { background: "#111827", color: "#fff", overflow: "hidden", transition: "all 0.25s ease", flexShrink: 0 },
  sidebarTitle: { margin: "0 0 12px", fontSize: 16, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 8 },
  menuList: { listStyle: "none", padding: 0, margin: 0 },
  menuItem: { padding: 10, borderRadius: 8, cursor: "pointer", marginBottom: 6, fontSize: 14, transition: "0.2s" },
  main: { flex: 1, padding: 24, minWidth: 0, boxSizing: "border-box" },
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  pageTitle: { margin: 0, fontSize: 26, color: "#0f172a", fontWeight: 800 },
  pageSubtitle: { margin: "4px 0 0", color: "#6b7280", fontSize: 14 },
  chip: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "5px 12px", fontSize: 13, color: "#374151" },
  toolbar: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: 240, padding: "10px 14px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 14, outline: "none", background: "#fff" },
  select: { padding: "10px 14px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 14, outline: "none", background: "#fff", cursor: "pointer" },
  emptyState: { textAlign: "center", padding: "80px 20px" },
  tableWrapper: { background: "#fff", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 700 },
  th: { textAlign: "left", padding: "12px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" },
  tr: { transition: "background 0.15s", cursor: "default" },
  td: { padding: "12px 16px", borderBottom: "1px solid #f1f5f9", fontSize: 14, verticalAlign: "middle" },
  marqueBadge: { width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0 },
  plateTag: { background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 6, padding: "4px 10px", fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "#1e293b", letterSpacing: "0.08em" },
  kmTag: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "3px 8px", fontSize: 12, color: "#065f46", fontWeight: 600 },
  avatar: { width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 },
  maintTag: { background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 6, padding: "3px 8px", fontSize: 12, color: "#92400e" },
  detailBtn: { background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" },
};

// ─── Styles modal ─────────────────────────────────────────────────────────────
const m = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 },
  modal: { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.25)" },
  banner: { padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderRadius: "16px 16px 0 0" },
  bannerTitle: { margin: 0, fontSize: 22, fontWeight: 800, color: "#fff", textShadow: "0 1px 4px rgba(0,0,0,0.3)" },
  bannerPlate: { display: "inline-block", marginTop: 6, background: "rgba(255,255,255,0.2)", color: "#fff", padding: "3px 10px", borderRadius: 6, fontFamily: "monospace", fontWeight: 700, fontSize: 14 },
  closeBtn: { background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
  statsRow: { display: "flex", gap: 10, padding: "16px 24px", flexWrap: "wrap", borderBottom: "1px solid #f1f5f9" },
  statBox: { flex: 1, minWidth: 90, border: "2px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", display: "flex", flexDirection: "column", gap: 2 },
  statNum: { fontSize: 20, fontWeight: 800, color: "#0f172a" },
  statLab: { fontSize: 11, color: "#6b7280" },
  tabs: { display: "flex", borderBottom: "1px solid #e5e7eb", padding: "0 24px", overflowX: "auto" },
  tab: { padding: "10px 14px", background: "none", border: "none", borderBottom: "2px solid transparent", cursor: "pointer", fontSize: 13, color: "#6b7280", fontWeight: 600, marginBottom: -1, whiteSpace: "nowrap" },
  tabActive: { borderBottomColor: "#2563eb", color: "#2563eb" },
  tabContent: { padding: "16px 24px 24px", minHeight: 200 },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  infoItem: { background: "#f8fafc", borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 3 },
  infoLabel: { fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" },
  infoVal: { fontSize: 14, color: "#0f172a", fontWeight: 600 },
  ownerCard: { display: "flex", alignItems: "center", gap: 14, background: "#f8fafc", borderRadius: 12, padding: "16px", marginBottom: 16 },
  ownerAvatarLg: { width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, flexShrink: 0 },
  roleBadge: { display: "inline-block", background: "#dbeafe", color: "#1e40af", borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 },
  loading: { color: "#9ca3af", fontSize: 14, textAlign: "center", padding: "40px 0" },
  empty: { color: "#9ca3af", fontSize: 14, textAlign: "center", padding: "40px 0" },
  rdvCard: { background: "#f8fafc", borderRadius: 10, padding: "12px 14px", marginBottom: 10, border: "1px solid #e2e8f0" },
  rdvTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  rdvService: { fontWeight: 700, fontSize: 14, color: "#0f172a" },
  rdvDate: { fontSize: 12, color: "#6b7280" },
  rdvComment: { fontSize: 13, color: "#475569", margin: "4px 0 0", fontStyle: "italic" },
  tachesList: { marginTop: 8, display: "flex", flexDirection: "column", gap: 4 },
  tacheItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#374151" },
  factureCard: { background: "#f8fafc", borderRadius: 10, padding: "12px 14px", marginBottom: 10, border: "1px solid #e2e8f0" },
  factureTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  factureNum: { fontWeight: 700, fontSize: 14, color: "#0f172a" },
  statutBadge: { padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 },
  factureTotal: { fontWeight: 800, fontSize: 16, color: "#0f172a" },
  factureDate: { fontSize: 12, color: "#6b7280" },
};