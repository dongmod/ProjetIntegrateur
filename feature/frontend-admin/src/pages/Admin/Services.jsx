import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;


// ─── Modal Créer / Éditer ─────────────────────────────────────────────────────
function ModalService({ service, onClose, onSave }) {
  const [form, setForm]   = useState({ nom: service?.nom || "", duree: service?.duree || "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handle = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.nom.trim() || !form.duree) {
      setError("Le nom et la durée sont obligatoires.");
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={m.modal} onClick={e => e.stopPropagation()}>
        <h2 style={m.title}>{service ? "✏️ Modifier le service" : "➕ Nouveau service"}</h2>

        {error && <p style={m.error}>{error}</p>}

        <div style={m.field}>
          <label style={m.label}>Nom du service</label>
          <input
            style={m.input}
            name="nom"
            value={form.nom}
            onChange={handle}
            placeholder="Ex: Vidange, Freinage, Diagnostic..."
            autoFocus
          />
        </div>

        <div style={m.field}>
          <label style={m.label}>Durée (minutes)</label>
          <input
            style={m.input}
            name="duree"
            type="number"
            min="1"
            value={form.duree}
            onChange={handle}
            placeholder="Ex: 30, 60, 90..."
          />
        </div>

        <div style={m.actions}>
          <button style={m.cancelBtn} onClick={onClose}>Annuler</button>
          <button style={m.saveBtn} onClick={submit} disabled={saving}>
            {saving ? "Enregistrement..." : service ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirmation suppression ─────────────────────────────────────────────────
function ModalConfirm({ service, onClose, onConfirm }) {
  return (
    <div style={m.overlay} onClick={onClose}>
      <div style={{ ...m.modal, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <h2 style={{ ...m.title, color: "#dc2626" }}>🗑️ Supprimer le service</h2>
        <p style={{ color: "#374151", margin: "0 0 20px", fontSize: 15 }}>
          Êtes-vous sûr de vouloir supprimer <strong>{service.nom}</strong> ?
          Cette action est irréversible.
        </p>
        <div style={m.actions}>
          <button style={m.cancelBtn} onClick={onClose}>Annuler</button>
          <button style={{ ...m.saveBtn, background: "#dc2626" }} onClick={onConfirm}>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Durée formatée ───────────────────────────────────────────────────────────
function formatDuree(min) {
  const m = parseInt(min);
  if (isNaN(m)) return min;
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h}h` : `${h}h ${r}min`;
}

// ─── Couleur par durée ────────────────────────────────────────────────────────
function dureeColor(min) {
  const m = parseInt(min);
  if (m <= 30)  return { bg: "#d1fae5", color: "#065f46", border: "#6ee7b7" };
  if (m <= 60)  return { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" };
  if (m <= 120) return { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" };
  return              { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" };
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Services() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const isGest = localStorage.getItem("role") === "gestionnaire";
  const authH    = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const [services,  setServices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [menuOpen,  setMenuOpen]  = useState(true);
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState(null); // null | { mode: "create"|"edit"|"delete", service? }
  const [toast,     setToast]     = useState(null);

  useEffect(() => {
    if (!token) return navigate("/", { replace: true });
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/services`, { headers: authH });
      const data = res.ok ? await res.json() : [];
      setServices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    const isEdit = modal?.mode === "edit";
    const url    = isEdit ? `${API_URL}/api/services/${modal.service.id}` : `${API_URL}/api/services`;
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, { method, headers: authH, body: JSON.stringify(form) });
    if (res.ok) {
      setModal(null);
      await fetchServices();
      showToast(isEdit ? "✅ Service mis à jour" : "✅ Service créé");
    } else {
      const err = await res.json();
      alert(err.message || "Erreur");
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`${API_URL}/api/services/${modal.service.id}`, {
      method: "DELETE", headers: authH
    });
    if (res.ok) {
      setModal(null);
      await fetchServices();
      showToast("🗑️ Service supprimé");
    } else {
      alert("Erreur lors de la suppression");
    }
  };

  const filtered = services.filter(s =>
    s.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <div style={s.page}>
      <Header onLogout={handleLogout} onToggleMenu={() => setMenuOpen(p => !p)} />

      {/* Toast */}
      {toast && (
        <div style={s.toast}>{toast}</div>
      )}

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
                    background: path === "/services" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.03)",
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
          {/* Header */}
          <div style={s.pageHeader}>
            <div>
              <h1 style={s.pageTitle}>🛠️ Services</h1>
              <p style={s.pageSubtitle}>Gérez les services proposés par le garage</p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={s.chip}>🛠️ {services.length} service{services.length !== 1 ? "s" : ""}</span>
              {isGest && (
                <button style={s.newBtn} onClick={() => setModal({ mode: "create" })}>
                  + Nouveau service
                </button>
              )}
            </div>
          </div>

          {/* Barre de recherche */}
          <div style={s.toolbar}>
            <input
              style={s.searchInput}
              placeholder="🔍 Rechercher un service..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Légende durée */}
          <div style={s.legend}>
            {[
              ["≤ 30 min", "#065f46", "#d1fae5"],
              ["≤ 1h",     "#1e40af", "#dbeafe"],
              ["≤ 2h",     "#92400e", "#fef3c7"],
              ["> 2h",     "#991b1b", "#fee2e2"],
            ].map(([label, color, bg]) => (
              <span key={label} style={{ ...s.legendItem, background: bg, color }}>
                {label}
              </span>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <p style={{ color: "#6b7280", padding: 20 }}>Chargement...</p>
          ) : filtered.length === 0 ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 48 }}>🛠️</p>
              <p style={{ color: "#6b7280" }}>Aucun service trouvé</p>
              {isGest && (
                <button style={s.newBtn} onClick={() => setModal({ mode: "create" })}>
                  Créer le premier service
                </button>
              )}
            </div>
          ) : (
            <div style={s.tableWrapper}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>#</th>
                    <th style={s.th}>Nom du service</th>
                    <th style={s.th}>Durée</th>
                    {isGest && <th style={{ ...s.th, textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((svc, idx) => {
                    const dc = dureeColor(svc.duree);
                    return (
                      <tr key={svc.id} style={s.tr}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                      >
                        {/* Numéro */}
                        <td style={{ ...s.td, color: "#9ca3af", width: 40, fontSize: 13 }}>
                          {idx + 1}
                        </td>

                        {/* Nom */}
                        <td style={s.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={s.serviceIcon}>🔧</div>
                            <span style={{ fontWeight: 600, fontSize: 15, color: "#0f172a" }}>
                              {svc.nom}
                            </span>
                          </div>
                        </td>

                        {/* Durée */}
                        <td style={s.td}>
                          <span style={{
                            ...s.dureeBadge,
                            background: dc.bg,
                            color: dc.color,
                            border: `1px solid ${dc.border}`,
                          }}>
                            ⏱ {formatDuree(svc.duree)}
                          </span>
                        </td>

                        {/* Actions */}
                        {isGest && (
                          <td style={{ ...s.td, textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              <button
                                style={s.editBtn}
                                onClick={() => setModal({ mode: "edit", service: svc })}
                              >
                                ✏️ Modifier
                              </button>
                              <button
                                style={s.deleteBtn}
                                onClick={() => setModal({ mode: "delete", service: svc })}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {(modal?.mode === "create" || modal?.mode === "edit") && (
        <ModalService
          service={modal.service || null}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {modal?.mode === "delete" && (
        <ModalConfirm
          service={modal.service}
          onClose={() => setModal(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  chip: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "5px 14px", fontSize: 13, color: "#374151" },
  newBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 9, cursor: "pointer", fontWeight: 700, fontSize: 14 },
  toolbar: { marginBottom: 14 },
  searchInput: { width: "100%", maxWidth: 420, padding: "10px 14px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" },
  legend: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" },
  legendItem: { padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  emptyState: { textAlign: "center", padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  tableWrapper: { background: "#fff", borderRadius: 14, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb", overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" },
  tr: { transition: "background 0.15s" },
  td: { padding: "13px 16px", borderBottom: "1px solid #f1f5f9", fontSize: 14, verticalAlign: "middle" },
  serviceIcon: { width: 34, height: 34, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 },
  dureeBadge: { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 700 },
  editBtn: { background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  deleteBtn: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 13 },
  toast: { position: "fixed", bottom: 24, right: 24, zIndex: 3000, background: "#1e293b", color: "#fff", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" },
};

const m = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 },
  modal: { background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 460, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" },
  title: { margin: "0 0 20px", fontSize: 20, color: "#0f172a" },
  error: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 14 },
  field: { marginBottom: 16, display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 },
  cancelBtn: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  saveBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "9px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },
};