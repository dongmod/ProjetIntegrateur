import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

const API_URL = "http://localhost:3000";

export default function MonProfil() {
  const navigate    = useNavigate();
  const { userId }  = useParams(); // si viene desde Utilisateurs
  const token       = localStorage.getItem("token");
  const authH       = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const [me,          setMe]          = useState(null);
  const [targetUser,  setTargetUser]  = useState(null);
  const [profil,      setProfil]      = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(true);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [editMode,    setEditMode]    = useState(false);

  const fileRef = useRef(null);

  const [form, setForm] = useState({
    telephone:      "",
    adresse:        "",
    date_naissance: "",
    photo_url:      "",
    bio:            "",
  });

  useEffect(() => {
    if (!token) return navigate("/", { replace: true });
    init();
  }, [userId]);

  const init = async () => {
    setLoading(true);
    try {
      // Profil de l'utilisateur connecté
      const meRes = await fetch(`${API_URL}/api/auth/me`, { headers: authH });
      const meData = meRes.ok ? await meRes.json() : null;
      setMe(meData);

      // Si on consulte le profil d'un autre utilisateur
      const targetId = userId || meData?.user_id;

      // Charger les infos de base de l'utilisateur cible
      const userRes = await fetch(`${API_URL}/api/auth/getUser`, { headers: authH });
      const users   = userRes.ok ? await userRes.json() : [];
      const target  = users.find(u => u.user_id === targetId) || meData;
      setTargetUser(target);

      // Charger le profil étendu
      const profilRes = await fetch(`${API_URL}/api/profils/${targetId}`, { headers: authH });
      const profilData = profilRes.ok ? await profilRes.json() : null;
      setProfil(profilData);

      if (profilData) {
        setForm({
          telephone:      profilData.telephone      || "",
          adresse:        profilData.adresse        || "",
          date_naissance: profilData.date_naissance || "",
          photo_url:      profilData.photo_url      || "",
          bio:            profilData.bio            || "",
        });
      }
    } catch (e) {
      setError("Impossible de charger le profil.");
    } finally {
      setLoading(false);
    }
  };

  // ── Upload photo via Supabase Storage ──────────────────────────────────────
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) return setError("Photo trop lourde (max 5MB)");
    

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) return setError("Format non supporté (JPG, PNG, WEBP)");

    setUploading(true);
    setError("");
    try {
      const ext      = file.name.split(".").pop();
      const fileName = `${me.user_id}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars_employes")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars_employes")
        .getPublicUrl(fileName);

      const photoUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      setForm(p => ({ ...p, photo_url: photoUrl }));
      setSuccess("Photo uploadée  — sauvegardez pour confirmer");
    } catch (e) {
      setError("Erreur upload: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  // ── Sauvegarder le profil ─────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/profils`, {
        method: "POST",
        headers: authH,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erreur sauvegarde");
      setSuccess("Profil mis à jour ");
      setEditMode(false);
      setTimeout(() => setSuccess(""), 3000);
      init();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const isOwnProfil  = !userId || userId === me?.user_id;
  const isGestionnaire = me?.role === "gestionnaire";
  const displayUser  = targetUser || me;
  const initiales    = `${displayUser?.prenom?.[0] || ""}${displayUser?.nom?.[0] || ""}`.toUpperCase();

  const ROLE_CONFIG = {
    gestionnaire: { label: "Gestionnaire", bg: "#dbeafe", color: "#1e40af" },
    employe:      { label: "Employé",      bg: "#d1fae5", color: "#065f46" },
    client:       { label: "Client",       bg: "#f3f4f6", color: "#374151" },
  };
  const roleStyle = ROLE_CONFIG[displayUser?.role] || ROLE_CONFIG.client;

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
                {(isGestionnaire ? [
                  ["🏠", "Tableau de bord", "/dashboard"],
                  ["👥", "Utilisateurs",    "/utilisateurs"],
                  ["📅", "Rendez-vous",     "/rendez-vous"],
                  ["✅", "Tâches",          "/gestion-taches"],
                ] : [
                  ["🏠", "Mon dashboard",  "/dashboard-employe"],
                  ["✅", "Mes tâches",      "/taches"],
                  ["📅", "Mes RDV",         "/mes-rendez-vous"],
                  ["👤", "Mon profil",      "/profil"],
                ]).map(([icon, label, path]) => (
                  <li key={path} style={{
                    ...s.menuItem,
                    background: path === "/profil" || path === "/utilisateurs"
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
          {/* Back button si on consulte un autre profil */}
          {userId && (
            <button style={s.backBtn} onClick={() => navigate(-1)}>
              ← Retour
            </button>
          )}

          {error   && <div style={s.alertError}>{error}</div>}
          {success && <div style={s.alertSuccess}>{success}</div>}

          {loading ? (
            <p style={{ color: "#6b7280", padding: 20 }}>Chargement...</p>
          ) : (
            <div style={s.profilLayout}>

              {/* ── Carte gauche : photo + identité ── */}
              <div style={s.cardLeft}>
                {/* Photo */}
                <div style={s.avatarZone}>
                  {form.photo_url ? (
                    <img src={form.photo_url} alt="avatar" style={s.avatarImg} />
                  ) : (
                    <div style={s.avatarInitiales}>{initiales}</div>
                  )}

                  {/* Bouton upload — seulement sur son propre profil */}
                  {isOwnProfil && (
                    <>
                      <button
                        style={s.uploadBtn}
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? "⏳ Upload..." : "📷 Changer la photo"}
                      </button>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: "none" }}
                        onChange={handlePhotoUpload}
                      />
                      <p style={s.uploadHint}>JPG, PNG, WEBP — max 5MB</p>
                      <p style={s.uploadHint}>JPG, PNG, WEBP — max 5MB</p>

{/* Bouton sauvegarder photo si nouvelle photo uploadée */}
{form.photo_url && form.photo_url !== (profil?.photo_url || "") && (
  <button
    style={{ ...s.saveBtn, marginTop: 8, fontSize: 12, padding: "6px 14px" }}
    onClick={handleSave}
    disabled={saving}
  >
    {saving ? "Sauvegarde..." : "💾 Sauvegarder la photo"}
  </button>
)}
                    </>
                  )}
                </div>

                {/* Identité */}
                <div style={s.identite}>
                  <h2 style={s.nomComplet}>
                    {displayUser?.prenom} {displayUser?.nom}
                  </h2>
                  <span style={{ ...s.roleBadge, background: roleStyle.bg, color: roleStyle.color }}>
                    {roleStyle.label}
                  </span>
                  <p style={s.emailDisplay}>{displayUser?.email}</p>
                </div>

                {/* Bio */}
                <div style={s.bioZone}>
                  <span style={s.bioLabel}>À propos</span>
                  {editMode ? (
                    <textarea
                      style={{ ...s.input, resize: "vertical", marginTop: 6 }}
                      rows={4}
                      placeholder="Décrivez-vous en quelques mots..."
                      value={form.bio}
                      onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    />
                  ) : (
                    <p style={s.bioText}>
                      {form.bio || "Aucune description pour le moment."}
                    </p>
                  )}
                </div>
              </div>

              {/* ── Carte droite : infos détaillées ── */}
              <div style={s.cardRight}>
                <div style={s.cardRightHeader}>
                  <h3 style={s.cardTitle}>
                    {isOwnProfil ? "Mes informations" : "Informations"}
                  </h3>
                  {isOwnProfil && !editMode && (
                    <button style={s.editBtn} onClick={() => setEditMode(true)}>
                      ✏️ Modifier
                    </button>
                  )}
                </div>

                <div style={s.formGrid}>
                  {/* Prénom */}
                  <div style={s.fg}>
                    <label style={s.label}>Prénom</label>
                    <div style={s.readonlyField}>{displayUser?.prenom || "—"}</div>
                  </div>

                  {/* Nom */}
                  <div style={s.fg}>
                    <label style={s.label}>Nom</label>
                    <div style={s.readonlyField}>{displayUser?.nom || "—"}</div>
                  </div>

                  {/* Email */}
                  <div style={{ ...s.fg, gridColumn: "1 / -1" }}>
                    <label style={s.label}>Email</label>
                    <div style={s.readonlyField}>{displayUser?.email || "—"}</div>
                  </div>

                  {/* Téléphone */}
                  <div style={s.fg}>
                    <label style={s.label}>Téléphone</label>
                    {editMode ? (
                      <input style={s.input} placeholder="+1 514 000 0000"
                        value={form.telephone}
                        onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))} />
                    ) : (
                      <div style={s.readonlyField}>{form.telephone || "—"}</div>
                    )}
                  </div>

                  {/* Date de naissance */}
                  <div style={s.fg}>
                    <label style={s.label}>Date de naissance</label>
                    {editMode ? (
                      <input type="date" style={s.input}
                        value={form.date_naissance}
                        onChange={e => setForm(p => ({ ...p, date_naissance: e.target.value }))} />
                    ) : (
                      <div style={s.readonlyField}>
                        {form.date_naissance
                          ? new Date(form.date_naissance).toLocaleDateString("fr-CA")
                          : "—"}
                      </div>
                    )}
                  </div>

                  {/* Adresse */}
                  <div style={{ ...s.fg, gridColumn: "1 / -1" }}>
                    <label style={s.label}>Adresse</label>
                    {editMode ? (
                      <input style={s.input} placeholder="123 rue Exemple, Montréal"
                        value={form.adresse}
                        onChange={e => setForm(p => ({ ...p, adresse: e.target.value }))} />
                    ) : (
                      <div style={s.readonlyField}>{form.adresse || "—"}</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {isOwnProfil && editMode && (
                  <div style={s.formActions}>
                    <button style={s.cancelBtn} onClick={() => { setEditMode(false); init(); }}>
                      Annuler
                    </button>
                    <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
                      {saving ? "Sauvegarde..." : "💾 Sauvegarder"}
                    </button>
                  </div>
                )}

                {/* Stats rapides */}
                {!isOwnProfil && isGestionnaire && (
                  <div style={s.statsZone}>
                    <h4 style={{ margin: "0 0 12px", color: "#374151", fontSize: 14 }}>
                      Accès rapide
                    </h4>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button style={s.quickBtn}
                        onClick={() => navigate(`/taches?employe=${displayUser?.user_id}`)}>
                        ✅ Voir ses tâches
                      </button>
                      <button style={s.quickBtn}
                        onClick={() => navigate(`/kanban`)}>
                        📊 Kanban
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
  backBtn: { background: "#f3f4f6", border: "1px solid #d1d5db", color: "#374151", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, marginBottom: 16, display: "inline-block" },
  alertError: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 14 },
  alertSuccess: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 14 },
  profilLayout: { display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" },
  cardLeft: { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: 20 },
  cardRight: { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb" },
  avatarZone: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10 },
  avatarImg: { width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "4px solid #e5e7eb" },
  avatarInitiales: { width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 800 },
  uploadBtn: { background: "#f3f4f6", border: "1px solid #d1d5db", color: "#374151", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  uploadHint: { margin: 0, fontSize: 11, color: "#9ca3af", textAlign: "center" },
  identite: { textAlign: "center" },
  nomComplet: { margin: "0 0 8px", fontSize: 20, color: "#0f172a", fontWeight: 800 },
  roleBadge: { display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  emailDisplay: { margin: "8px 0 0", fontSize: 13, color: "#6b7280" },
  bioZone: { borderTop: "1px solid #f1f5f9", paddingTop: 16 },
  bioLabel: { fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" },
  bioText: { margin: "6px 0 0", fontSize: 13, color: "#6b7280", lineHeight: 1.6 },
  cardRightHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  cardTitle: { margin: 0, fontSize: 18, color: "#0f172a", fontWeight: 700 },
  editBtn: { background: "#f3f4f6", border: "1px solid #d1d5db", color: "#374151", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fg: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  readonlyField: { padding: "9px 12px", borderRadius: 8, background: "#f9fafb", border: "1px solid #f1f5f9", fontSize: 14, color: "#374151", minHeight: 38 },
  formActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" },
  cancelBtn: { background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14 },
  saveBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },
  statsZone: { marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" },
  quickBtn: { background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 },
};