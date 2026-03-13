//PAGE UTILISATEURS 
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3001";

const ROLES = ["gestionnaire", "employe", "client"];

const initialForm = {
  nom: "",
  prenom: "",
  email: "",
  mot_de_passe: "",
  confirmation_mot_de_passe: "",
  role: "employe",
};

const Utilisateurs = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [profils, setProfils] = useState({});
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Search
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    if (!token) return navigate("/", { replace: true });
    fetchUsers();
  }, []);

  const fetchProfils = async (users) => {
    const profilsMap = {};
    await Promise.all(
      users.map(async (u) => {
        try {
          const res = await fetch(`${API_URL}/api/profils/${u.user_id}`, {
            headers: authHeaders,
          });
          if (res.ok) {
            const p = await res.json();
            if (p?.photo_url) profilsMap[u.user_id] = p.photo_url;
          }
        } catch {}
      })
    );
    setProfils(profilsMap);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/auth/getUser`, {
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data);
      fetchProfils(data);
    } catch (err) {
      setError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(initialForm);
    setFormError("");
    setModalMode("create");
    setSelectedUser(null);
    setShowModal(true);
  };

  const openEdit = (user) => {
    setForm({
      nom: user.nom || "",
      prenom: user.prenom || "",
      email: user.email || "",
      mot_de_passe: "",
      confirmation_mot_de_passe: "",
      role: user.role || "employe",
    });
    setFormError("");
    setModalMode("edit");
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setForm(initialForm);
    setFormError("");
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async () => {
    setFormError("");
    if (!form.nom || !form.prenom || !form.email || !form.mot_de_passe) {
      return setFormError("Tous les champs sont obligatoires.");
    }
    if (form.mot_de_passe !== form.confirmation_mot_de_passe) {
      return setFormError("Les mots de passe ne correspondent pas.");
    }
    setFormLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      setSuccess("Employé créé avec succès !");
      closeModal();
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    setFormError("");
    if (!form.nom || !form.prenom || !form.email) {
      return setFormError("Nom, prénom et email sont obligatoires.");
    }
    if (form.mot_de_passe && form.mot_de_passe !== form.confirmation_mot_de_passe) {
      return setFormError("Les mots de passe ne correspondent pas.");
    }
    setFormLoading(true);
    try {
      const body = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        role: form.role,
        ...(form.mot_de_passe ? { mot_de_passe: form.mot_de_passe } : {}),
      };
      const res = await fetch(`${API_URL}/api/auth/updateUser/${selectedUser.user_id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      setSuccess("Employé mis à jour !");
      closeModal();
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/deleteUser/${deleteTarget.user_id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSuccess("Employé supprimé.");
      setDeleteTarget(null);
      fetchUsers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Erreur lors de la suppression.");
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.nom?.toLowerCase().includes(q) ||
      u.prenom?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  const roleColor = (role) => {
    if (role === "gestionnaire") return { background: "#dbeafe", color: "#1d4ed8" };
    if (role === "employe") return { background: "#d1fae5", color: "#065f46" };
    if (role === "client") return { background: "#fef3c7", color: "#92400e" };
    return { background: "#f3f4f6", color: "#374151" };
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const Avatar = ({ user }) => {
    const photo = profils[user.user_id];
    const initiales = `${user.prenom?.[0] || ""}${user.nom?.[0] || ""}`.toUpperCase();
    return photo ? (
      <img
        src={photo}
        alt="avatar"
        style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e7eb" }}
      />
    ) : (
      <div style={{
        width: 38, height: 38, borderRadius: "50%",
        background: "linear-gradient(135deg, #2563eb, #7c3aed)",
        color: "#fff", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 13, fontWeight: 800,
        flexShrink: 0,
      }}>
        {initiales}
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <Header
        onLogout={handleLogout}
        onToggleMenu={() => setMenuOpen((prev) => !prev)}
      />

      <div style={styles.layout}>
        {/* Sidebar */}
        <aside style={{ ...styles.sidebar, width: menuOpen ? 240 : 0, padding: menuOpen ? "16px 12px" : 0 }}>
          {menuOpen && (
            <>
              <h3 style={styles.sidebarTitle}>Navigation</h3>
              <ul style={styles.menuList}>
                {[
                  { icon: "🏠", label: "Tableau de bord", path: "/dashboard" },
                  { icon: "📅", label: "Rendez-vous", path: "/rendez-vous" },
                  { icon: "✅", label: "Gestion des tâches", path: "/gestion-taches" },
                  { icon: "👥", label: "Utilisateurs", path: "/utilisateurs" },
                  { icon: "🛠️", label: "Services", path: "/services" },
                  { icon: "🚗", label: "Véhicules", path: "/vehicules" },
                  { icon: "🔔", label: "Notifications", path: "/notifications" },
                  { icon: "⚙️", label: "Paramètres", path: "/parametres" },
                ].map(({ icon, label, path }) => (
                  <li
                    key={path}
                    style={{
                      ...styles.menuItem,
                      background: path === "/utilisateurs" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.03)",
                    }}
                    onClick={() => navigate(path)}
                  >
                    {icon} {label}
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        {/* Main */}
        <main style={styles.main}>
          <div style={styles.pageHeader}>
            <div>
              <h1 style={styles.pageTitle}>👥 Gestion des employés</h1>
              <p style={styles.pageSubtitle}>Gérez les comptes, rôles et accès de votre équipe</p>
            </div>
            <button style={styles.createBtn} onClick={openCreate}>
              + Nouvel employé
            </button>
          </div>

          {error && <div style={styles.alertError}>{error}</div>}
          {success && <div style={styles.alertSuccess}>{success}</div>}

          <div style={styles.toolbar}>
            <input
              style={styles.searchInput}
              placeholder="🔍 Rechercher par nom, email, rôle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span style={styles.count}>
              {filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <p style={{ padding: 20, color: "#6b7280" }}>Chargement...</p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Photo", "Nom", "Prénom", "Email", "Rôle", "Actions"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user) => (
                      <tr key={user.user_id} style={styles.tr}>
                        <td style={{ ...styles.td, width: 56 }}>
                          <Avatar user={user} />
                        </td>
                        <td style={styles.td}>{user.nom}</td>
                        <td style={styles.td}>{user.prenom}</td>
                        <td style={styles.td}>{user.email}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.badge, ...roleColor(user.role) }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button style={styles.editBtn} onClick={() => openEdit(user)}>
                            ✏️ Éditer
                          </button>
                          <button style={styles.deleteBtn} onClick={() => setDeleteTarget(user)}>
                            🗑️ Supprimer
                          </button>
                          <button
                            style={styles.profilBtn}
                            onClick={() => navigate(`/profil/${user.user_id}`)}
                          >
                            👤 Profil
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {modalMode === "create" ? "➕ Nouvel employé" : "✏️ Modifier l'employé"}
            </h2>

            {formError && <div style={styles.alertError}>{formError}</div>}

            <div style={styles.formGrid}>
              {[
                { name: "nom", label: "Nom", type: "text" },
                { name: "prenom", label: "Prénom", type: "text" },
                { name: "email", label: "Email", type: "email" },
              ].map(({ name, label, type }) => (
                <div key={name} style={styles.formGroup}>
                  <label style={styles.label}>{label}</label>
                  <input
                    style={styles.input}
                    type={type}
                    name={name}
                    value={form[name]}
                    onChange={handleFormChange}
                    placeholder={label}
                  />
                </div>
              ))}

              <div style={styles.formGroup}>
                <label style={styles.label}>Rôle</label>
                <select style={styles.input} name="role" value={form.role} onChange={handleFormChange}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {modalMode === "edit" ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
                </label>
                <input
                  style={styles.input}
                  type="password"
                  name="mot_de_passe"
                  value={form.mot_de_passe}
                  onChange={handleFormChange}
                  placeholder="••••••••"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Confirmation mot de passe</label>
                <input
                  style={styles.input}
                  type="password"
                  name="confirmation_mot_de_passe"
                  value={form.confirmation_mot_de_passe}
                  onChange={handleFormChange}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={closeModal}>Annuler</button>
              <button
                style={styles.confirmBtn}
                onClick={modalMode === "create" ? handleCreate : handleEdit}
                disabled={formLoading}
              >
                {formLoading ? "..." : modalMode === "create" ? "Créer" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: 400 }}>
            <h2 style={{ ...styles.modalTitle, color: "#dc2626" }}>🗑️ Confirmer la suppression</h2>
            <p style={{ color: "#374151", marginBottom: 24 }}>
              Voulez-vous vraiment supprimer{" "}
              <strong>{deleteTarget.prenom} {deleteTarget.nom}</strong> ?
              Cette action est irréversible.
            </p>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button style={{ ...styles.confirmBtn, background: "#dc2626" }} onClick={handleDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#f4f7fb",
    fontFamily: "Arial, sans-serif",
    color: "#1f2937",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  layout: {
    display: "flex",
    minHeight: "calc(100vh - 70px)",
    width: "100%",
  },
  sidebar: {
    background: "#111827",
    color: "#fff",
    overflow: "hidden",
    transition: "all 0.25s ease",
    flexShrink: 0,
  },
  sidebarTitle: {
    margin: "0 0 12px 0",
    fontSize: 16,
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    paddingBottom: 8,
  },
  menuList: { listStyle: "none", padding: 0, margin: 0 },
  menuItem: {
    padding: 10,
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 6,
    fontSize: 14,
    transition: "0.2s",
  },
  main: {
    flex: 1,
    padding: 24,
    minWidth: 0,
    boxSizing: "border-box",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    flexWrap: "wrap",
    gap: 12,
  },
  pageTitle: { margin: 0, fontSize: 26, color: "#0f172a" },
  pageSubtitle: { margin: "4px 0 0", color: "#6b7280", fontSize: 14 },
  createBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: 200,
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
  },
  count: { color: "#6b7280", fontSize: 13, whiteSpace: "nowrap" },
  tableWrapper: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
    overflowX: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 650 },
  th: {
    textAlign: "left",
    padding: "12px 14px",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    fontSize: 13,
    fontWeight: 700,
    color: "#374151",
    whiteSpace: "nowrap",
  },
  tr: { transition: "background 0.15s" },
  td: {
    padding: "10px 14px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: 14,
    verticalAlign: "middle",
  },
  badge: {
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    display: "inline-block",
  },
  editBtn: {
    background: "#f0f9ff",
    color: "#0369a1",
    border: "1px solid #bae6fd",
    padding: "5px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    marginRight: 6,
    fontWeight: 600,
  },
  deleteBtn: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    padding: "5px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
    marginRight: 6,
  },
  profilBtn: {
    background: "#eff6ff",
    color: "#1e40af",
    border: "1px solid #bfdbfe",
    padding: "5px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  alertError: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 14,
    fontSize: 14,
  },
  alertSuccess: {
    background: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #bbf7d0",
    borderRadius: 8,
    padding: "10px 14px",
    marginBottom: 14,
    fontSize: 14,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: 16,
  },
  modal: {
    background: "#fff",
    borderRadius: 14,
    padding: 28,
    width: "100%",
    maxWidth: 560,
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitle: { margin: "0 0 18px", fontSize: 20, color: "#0f172a" },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },
  formGroup: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 22,
  },
  cancelBtn: {
    background: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    padding: "9px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
  },
  confirmBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "9px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },
};

export default Utilisateurs;