import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001";

const URGENCE_CONFIG = {
  haute:   { label: "Haute",   bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
  moyenne: { label: "Moyenne", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  basse:   { label: "Basse",   bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
};

const STATUT_CONFIG = {
  attribue: { label: "Attribué",  bg: "#dbeafe", color: "#1e40af" },
  en_cours: { label: "En cours",  bg: "#fef3c7", color: "#92400e" },
  termine:  { label: "Terminé",   bg: "#f0fdf4", color: "#065f46" },
};

const EMPTY_FORM = {
  titre: "", description: "", statut: "attribue",
  niveau_urgence: "moyenne", employe_id: "",
  poste_id: "", heure_debut: "", heure_fin: "",
  rendezvous_id: "",
};

function Badge({ val, config }) {
  const cfg = config[val];
  if (!cfg) return <span style={{ fontSize: 12, color: "#9ca3af" }}>—</span>;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: cfg.bg, color: cfg.color,
      padding: "2px 9px", borderRadius: 20, fontSize: 12, fontWeight: 700,
    }}>
      {cfg.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />}
      {cfg.label}
    </span>
  );
}

function Modal({ mode, form, employes, postes, rdvs, onChange, onSave, onClose, loading }) {
  const isEdit = mode === "edit";
  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>
            {isEdit ? "✏️ Modifier la tâche" : "➕ Nouvelle tâche"}
          </h2>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={s.formGrid}>
          <div style={{ ...s.fg, gridColumn: "1 / -1" }}>
            <label style={s.label}>Titre *</label>
            <input style={s.input} placeholder="Titre de la tâche"
              value={form.titre} onChange={e => onChange("titre", e.target.value)} />
          </div>

          <div style={{ ...s.fg, gridColumn: "1 / -1" }}>
            <label style={s.label}>Description *</label>
            <textarea style={{ ...s.input, resize: "vertical" }} rows={3}
              placeholder="Description détaillée..."
              value={form.description} onChange={e => onChange("description", e.target.value)} />
          </div>

          <div style={s.fg}>
            <label style={s.label}>Statut</label>
            <select style={s.input} value={form.statut}
              onChange={e => onChange("statut", e.target.value)}>
              <option value="attribue">Attribué</option>
              <option value="en_cours">En cours</option>
              <option value="termine">Terminé</option>
            </select>
          </div>

          <div style={s.fg}>
            <label style={s.label}>Niveau d'urgence</label>
            <select style={s.input} value={form.niveau_urgence}
              onChange={e => onChange("niveau_urgence", e.target.value)}>
              <option value="haute">🔴 Haute</option>
              <option value="moyenne">🟡 Moyenne</option>
              <option value="basse">🟢 Basse</option>
            </select>
          </div>

          <div style={s.fg}>
            <label style={s.label}>Employé assigné</label>
            <select style={s.input} value={form.employe_id}
              onChange={e => onChange("employe_id", e.target.value)}>
              <option value="">— Sélectionner —</option>
              {employes.map(e => (
                <option key={e.user_id} value={e.user_id}>
                  {e.prenom} {e.nom}
                </option>
              ))}
            </select>
          </div>

          <div style={s.fg}>
            <label style={s.label}>Poste de travail</label>
            <select style={s.input} value={form.poste_id}
              onChange={e => onChange("poste_id", e.target.value)}>
              <option value="">— Sélectionner —</option>
              {postes.map(p => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          </div>

          <div style={s.fg}>
            <label style={s.label}>Heure début</label>
            <input type="time" style={s.input} value={form.heure_debut}
              onChange={e => onChange("heure_debut", e.target.value)} />
          </div>

          <div style={s.fg}>
            <label style={s.label}>Heure fin</label>
            <input type="time" style={s.input} value={form.heure_fin}
              onChange={e => onChange("heure_fin", e.target.value)} />
          </div>

          <div style={{ ...s.fg, gridColumn: "1 / -1" }}>
            <label style={s.label}>Rendez-vous lié</label>
            <select style={s.input} value={form.rendezvous_id}
              onChange={e => onChange("rendezvous_id", e.target.value)}>
              <option value="">— Aucun —</option>
              {rdvs.map(r => (
                <option key={r.id} value={r.id}>
                  {r.date_rendezvous?.slice(0, 10)} — {r.type_service || "RDV"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={s.modalActions}>
          <button style={s.cancelBtn} onClick={onClose}>Annuler</button>
          <button style={s.saveBtn} onClick={onSave} disabled={loading}>
            {loading ? "..." : isEdit ? "💾 Sauvegarder" : "➕ Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalDetail({ tache, onClose }) {
  const urgence = URGENCE_CONFIG[tache.niveau_urgence] || URGENCE_CONFIG.moyenne;
  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalHeader}>
          <h2 style={s.modalTitle}>📋 Détail de la tâche</h2>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ borderLeft: `4px solid ${urgence.dot}`, paddingLeft: 14, marginBottom: 18 }}>
          <h3 style={{ margin: "0 0 4px", color: "#0f172a" }}>{tache.titre}</h3>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>{tache.description}</p>
        </div>
        <div style={s.detailGrid}>
          {[
            ["Statut",    <Badge val={tache.statut} config={STATUT_CONFIG} />],
            ["Urgence",   <Badge val={tache.niveau_urgence} config={URGENCE_CONFIG} />],
            ["Employé",   tache.utilisateurs ? `${tache.utilisateurs.prenom} ${tache.utilisateurs.nom}` : "—"],
            ["Poste",     tache.postes_travail?.nom || "—"],
            ["Début",     tache.heure_debut?.slice(0,5) || "—"],
            ["Fin",       tache.heure_fin?.slice(0,5) || "—"],
            ["RDV lié",   tache.rendezvous_id ? "Oui" : "Non"],
            ["Créée le",  tache.created_at ? new Date(tache.created_at).toLocaleDateString("fr-CA") : "—"],
          ].map(([label, val]) => (
            <div key={label} style={s.detailItem}>
              <span style={s.detailLabel}>{label}</span>
              <span style={s.detailVal}>{val}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
          <button style={s.cancelBtn} onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default function GestionTaches() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const authH    = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const [taches,    setTaches]    = useState([]);
  const [employes,  setEmployes]  = useState([]);
  const [postes,    setPostes]    = useState([]);
  const [rdvs,      setRdvs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(true);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  // Modal state
  const [modal,       setModal]       = useState(null); // null | "create" | "edit" | "detail"
  const [modalTache,  setModalTache]  = useState(null);
  const [form,        setForm]        = useState(EMPTY_FORM);

  // Filtres
  const [filterStatut,  setFilterStatut]  = useState("tous");
  const [filterUrgence, setFilterUrgence] = useState("tous");
  const [search,        setSearch]        = useState("");

  // Confirmation delete
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!token) return navigate("/", { replace: true });
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tRes, eRes, pRes, rRes] = await Promise.all([
        fetch(`${API_URL}/api/taches/all`,      { headers: authH }),
        fetch(`${API_URL}/api/auth/getUser`,     { headers: authH }),
        fetch(`${API_URL}/api/posteTravail`,     { headers: authH }),
        fetch(`${API_URL}/api/rendezvous/all`,   { headers: authH }),
      ]);
      const tData = tRes.ok ? await tRes.json() : [];
      const eData = eRes.ok ? await eRes.json() : [];
      const pData = pRes.ok ? await pRes.json() : [];
      const rData = rRes.ok ? await rRes.json() : [];

      setTaches(tData);
      setEmployes(eData.filter(u => u.role === "employe"));
      setPostes(pData);
      setRdvs(rData);
    } catch (e) {
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleCreate = () => {
    setForm(EMPTY_FORM);
    setModal("create");
  };

  const handleEdit = (tache) => {
    setForm({
      titre:          tache.titre || "",
      description:    tache.description || "",
      statut:         tache.statut || "attribue",
      niveau_urgence: tache.niveau_urgence || "moyenne",
      employe_id:     tache.employe_id || "",
      poste_id:       tache.poste_id || "",
      heure_debut:    tache.heure_debut?.slice(0, 5) || "",
      heure_fin:      tache.heure_fin?.slice(0, 5) || "",
      rendezvous_id:  tache.rendezvous_id || "",
    });
    setModalTache(tache);
    setModal("edit");
  };

  const handleDetail = (tache) => {
    setModalTache(tache);
    setModal("detail");
  };

  const handleSave = async () => {
    if (!form.titre || !form.description) {
      return setError("Titre et description sont obligatoires");
    }
    setSaving(true);
    setError("");
    try {
      const isEdit = modal === "edit";
      const url    = isEdit
        ? `${API_URL}/api/taches/${modalTache.id}`
        : `${API_URL}/api/taches`;
      const method = isEdit ? "PUT" : "POST";

      const body = {
        ...form,
        employe_id:    form.employe_id    || null,
        poste_id:      form.poste_id      || null,
        rendezvous_id: form.rendezvous_id || null,
        heure_debut:   form.heure_debut   || null,
        heure_fin:     form.heure_fin     || null,
      };

      const res = await fetch(url, {
        method, headers: authH, body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Erreur sauvegarde");

      setSuccess(isEdit ? "Tâche modifiée ✅" : "Tâche créée ✅");
      setTimeout(() => setSuccess(""), 3000);
      setModal(null);
      fetchAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/taches/${id}`, {
        method: "DELETE", headers: authH,
      });
      if (!res.ok) throw new Error("Erreur suppression");
      setSuccess("Tâche supprimée ✅");
      setTimeout(() => setSuccess(""), 3000);
      setDeleteId(null);
      fetchAll();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  // Filtrage
  const filtered = taches
    .filter(t => filterStatut  === "tous" || t.statut         === filterStatut)
    .filter(t => filterUrgence === "tous" || t.niveau_urgence === filterUrgence)
    .filter(t => !search
      || t.titre?.toLowerCase().includes(search.toLowerCase())
      || t.utilisateurs?.nom?.toLowerCase().includes(search.toLowerCase())
      || t.utilisateurs?.prenom?.toLowerCase().includes(search.toLowerCase())
    );

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
                  ["🏠", "Tableau de bord",  "/dashboard"],
                  ["📅", "Rendez-vous",       "/rendez-vous"],
                  ["✅", "Tâches",            "/gestion-taches"],
                  ["📊", "Kanban",            "/kanban"],
                  ["👥", "Utilisateurs",      "/utilisateurs"],
                  ["🕐", "Créneaux",          "/crenaux"],
                ].map(([icon, label, path]) => (
                  <li key={path} style={{
                    ...s.menuItem,
                    background: path === "/gestion-taches"
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
              <h1 style={s.pageTitle}>✅ Gestion des Tâches</h1>
              <p style={s.pageSubtitle}>Créez, assignez et suivez toutes les tâches de l'équipe</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={s.kanbanBtn} onClick={() => navigate("/kanban")}>
                📊 Vue Kanban
              </button>
              <button style={s.newBtn} onClick={handleCreate}>
                ➕ Nouvelle tâche
              </button>
            </div>
          </div>

          {error   && <div style={s.alertError}>{error}</div>}
          {success && <div style={s.alertSuccess}>{success}</div>}

          {/* Stats */}
          <div style={s.statsRow}>
            {[
              { label: "Attribuées", count: counts.attribue, color: "#3b82f6" },
              { label: "En cours",   count: counts.en_cours, color: "#f59e0b" },
              { label: "Terminées",  count: counts.termine,  color: "#10b981" },
              { label: "Total",      count: taches.length,   color: "#6366f1" },
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
            <input style={s.searchInput} placeholder="🔍 Rechercher par titre ou employé..."
              value={search} onChange={e => setSearch(e.target.value)} />
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

          {/* Table */}
          {loading ? (
            <p style={{ color: "#6b7280", padding: 20 }}>Chargement...</p>
          ) : filtered.length === 0 ? (
            <div style={s.emptyState}>
              <p style={{ fontSize: 40 }}>📭</p>
              <p style={{ color: "#6b7280" }}>Aucune tâche trouvée</p>
            </div>
          ) : (
            <div style={s.tableWrapper}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    {["Titre", "Urgence", "Statut", "Employé", "Poste", "Horaire", "Actions"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => (
                    <tr key={t.id} style={{ ...s.tr, background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                      <td style={s.td}>
                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 14 }}>{t.titre}</div>
                        {t.description && (
                          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {t.description}
                          </div>
                        )}
                      </td>
                      <td style={s.td}><Badge val={t.niveau_urgence} config={URGENCE_CONFIG} /></td>
                      <td style={s.td}><Badge val={t.statut} config={STATUT_CONFIG} /></td>
                      <td style={s.td}>
                        {t.utilisateurs
                          ? <span style={s.employeChip}>
                              {t.utilisateurs.prenom?.[0]}{t.utilisateurs.nom?.[0]}
                              <span style={{ marginLeft: 6 }}>{t.utilisateurs.prenom} {t.utilisateurs.nom}</span>
                            </span>
                          : <span style={{ color: "#9ca3af", fontSize: 13 }}>Non assigné</span>
                        }
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 13, color: "#374151" }}>
                          {t.postes_travail?.nom || "—"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 13, color: "#374151", fontFamily: "monospace" }}>
                          {t.heure_debut?.slice(0,5) || "—"} → {t.heure_fin?.slice(0,5) || "—"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={s.iconBtn} title="Détail" onClick={() => handleDetail(t)}>👁️</button>
                          <button style={s.iconBtn} title="Modifier" onClick={() => handleEdit(t)}>✏️</button>
                          <button style={{ ...s.iconBtn, ...s.iconBtnDanger }} title="Supprimer" onClick={() => setDeleteId(t.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Modal créer/éditer */}
      {(modal === "create" || modal === "edit") && (
        <Modal
          mode={modal}
          form={form}
          employes={employes}
          postes={postes}
          rdvs={rdvs}
          onChange={handleChange}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}

      {/* Modal détail */}
      {modal === "detail" && modalTache && (
        <ModalDetail tache={modalTache} onClose={() => setModal(null)} />
      )}

      {/* Confirmation suppression */}
      {deleteId && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: 380, textAlign: "center" }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>🗑️</p>
            <h3 style={{ margin: "0 0 8px", color: "#0f172a" }}>Supprimer la tâche ?</h3>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
              Cette action est irréversible.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button style={s.cancelBtn} onClick={() => setDeleteId(null)}>Annuler</button>
              <button style={{ ...s.saveBtn, background: "#ef4444" }} onClick={() => handleDelete(deleteId)}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// En cada tarjeta/fila de tâche
<button onClick={() => navigate(`/taches/${tache.id}/commentaires`)}>
  💬 Commentaires
</button>

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
  statsRow: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" },
  statCard: { background: "#fff", borderRadius: 10, padding: "12px 18px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb", minWidth: 130 },
  statDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  statCount: { fontSize: 22, fontWeight: 800, color: "#0f172a" },
  statLabel: { fontSize: 13, color: "#6b7280" },
  toolbar: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: 200, padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none" },
  select: { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", background: "#fff" },
  newBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },
  kanbanBtn: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  tableWrapper: { overflowX: "auto", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
  thead: { background: "#f8fafc" },
  th: { padding: "12px 14px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e5e7eb" },
  tr: { borderBottom: "1px solid #f1f5f9", transition: "0.1s" },
  td: { padding: "12px 14px", verticalAlign: "middle" },
  employeChip: { display: "inline-flex", alignItems: "center", background: "#eff6ff", color: "#1e40af", padding: "3px 10px", borderRadius: 20, fontSize: 13, fontWeight: 600 },
  iconBtn: { background: "#f3f4f6", border: "1px solid #e5e7eb", padding: "5px 9px", borderRadius: 6, cursor: "pointer", fontSize: 14 },
  iconBtnDanger: { background: "#fef2f2", border: "1px solid #fecaca" },
  emptyState: { textAlign: "center", padding: "60px 20px" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 },
  modal: { background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 560, boxShadow: "0 20px 50px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { margin: 0, fontSize: 20, color: "#0f172a" },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#9ca3af" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 8 },
  fg: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: { padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 },
  cancelBtn: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  saveBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  detailItem: { display: "flex", flexDirection: "column", gap: 3, padding: "10px 12px", background: "#f9fafb", borderRadius: 8 },
  detailLabel: { fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" },
  detailVal: { fontSize: 14, color: "#1f2937", fontWeight: 500 },
};