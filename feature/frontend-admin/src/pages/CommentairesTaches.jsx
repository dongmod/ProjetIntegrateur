// Page to make commentaires about the service 

import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:3001";

function CommentaireBubble({ comment, currentUserId }) {
  const isMe = comment.employe_id === currentUserId;
  const auteur = comment.utilisateurs
    ? `${comment.utilisateurs.prenom} ${comment.utilisateurs.nom}`
    : "Employé";
  const date = new Date(comment.created_at).toLocaleString("fr-CA", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div style={{
      display: "flex",
      flexDirection: isMe ? "row-reverse" : "row",
      alignItems: "flex-end",
      gap: 10,
      marginBottom: 16,
    }}>
      {/* Avatar */}
      <div style={{
        ...s.avatar,
        background: isMe ? "#2563eb" : "#6b7280",
        flexShrink: 0,
      }}>
        {auteur[0]?.toUpperCase()}
      </div>

      {/* Bulle */}
      <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
        <span style={{ fontSize: 11, color: "#9ca3af", marginBottom: 3 }}>
          {isMe ? "Vous" : auteur} · {date}
        </span>
        <div style={{
          ...s.bubble,
          background: isMe ? "#2563eb" : "#fff",
          color: isMe ? "#fff" : "#1f2937",
          borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
          boxShadow: isMe ? "0 2px 8px rgba(37,99,235,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
        }}>
          <p style={{ margin: 0, lineHeight: 1.5 }}>{comment.contenu}</p>
          {comment.visible_client && (
            <span style={{
              display: "inline-block", marginTop: 6,
              fontSize: 10, fontWeight: 700,
              background: isMe ? "rgba(255,255,255,0.2)" : "#dbeafe",
              color: isMe ? "#fff" : "#1e40af",
              padding: "2px 7px", borderRadius: 10,
            }}>
              👁️ Visible client
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommentairesTache() {
  const navigate   = useNavigate();
  const { tacheId } = useParams();
  const token      = localStorage.getItem("token");
  const authH      = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const [user,         setUser]         = useState(null);
  const [tache,        setTache]        = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [sending,      setSending]      = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(true);
  const [error,        setError]        = useState("");
  const [contenu,      setContenu]      = useState("");
  const [visibleClient, setVisibleClient] = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (!token) return navigate("/", { replace: true });
    init();
  }, [tacheId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [commentaires]);

  const init = async () => {
    setLoading(true);
    try {
      // Profil utilisateur
      const meRes = await fetch(`${API_URL}/api/auth/me`, { headers: authH });
      const me = meRes.ok ? await meRes.json() : null;
      setUser(me);

      // Si on a un tacheId, charger la tâche et ses commentaires
      if (tacheId) {
        const [tRes, cRes] = await Promise.all([
          fetch(`${API_URL}/api/taches/${tacheId}`, { headers: authH }),
          fetch(`${API_URL}/api/commentaires-taches/${tacheId}`, { headers: authH }),
        ]);
        const tData = tRes.ok ? await tRes.json() : null;
        const cData = cRes.ok ? await cRes.json() : [];
        setTache(tData);
        setCommentaires(cData);
      }
    } catch (e) {
      setError("Impossible de charger les commentaires.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!contenu.trim()) return;
    if (!user?.user_id) return setError("Utilisateur non identifié");
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/commentaires-taches`, {
        method: "POST",
        headers: authH,
        body: JSON.stringify({
          tache_id:       tacheId,
          employe_id:     user.user_id,
          contenu:        contenu.trim(),
          visible_client: visibleClient,
        }),
      });
      if (!res.ok) throw new Error("Erreur envoi");
      setContenu("");
      setVisibleClient(false);
      // Recharger commentaires
      const cRes = await fetch(`${API_URL}/api/commentaires-taches/${tacheId}`, { headers: authH });
      const cData = cRes.ok ? await cRes.json() : [];
      setCommentaires(cData);
      inputRef.current?.focus();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  const isGestionnaire = user?.role === "gestionnaire";

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
                  ["🏠", "Tableau de bord",  "/dashboard"],
                  ["✅", "Tâches",            "/gestion-taches"],
                  ["📊", "Kanban",            "/kanban"],
                  ["📅", "Rendez-vous",       "/rendez-vous"],
                ] : [
                  ["🏠", "Mon dashboard",    "/dashboard-employe"],
                  ["✅", "Mes tâches",        "/taches"],
                  ["📊", "Kanban",            "/kanban"],
                  ["📅", "Mes rendez-vous",   "/mes-rendez-vous"],
                ]).map(([icon, label, path]) => (
                  <li key={path} style={{
                    ...s.menuItem,
                    background: "rgba(255,255,255,0.03)",
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
          {/* Top bar */}
          <div style={s.topBar}>
            <button style={s.backBtn} onClick={() => navigate(-1)}>
              ← Retour
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={s.pageTitle}>
                💬 Commentaires
                {tache && <span style={s.tacheTitre}> — {tache.titre}</span>}
              </h1>
              <p style={s.pageSubtitle}>
                {commentaires.length} commentaire{commentaires.length > 1 ? "s" : ""}
                {tache && (
                  <span style={{
                    marginLeft: 10,
                    background: tache.niveau_urgence === "haute" ? "#fee2e2" : tache.niveau_urgence === "basse" ? "#d1fae5" : "#fef3c7",
                    color: tache.niveau_urgence === "haute" ? "#991b1b" : tache.niveau_urgence === "basse" ? "#065f46" : "#92400e",
                    padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  }}>
                    {tache.niveau_urgence}
                  </span>
                )}
              </p>
            </div>
          </div>

          {error && <div style={s.alertError}>{error}</div>}

          {/* Zone commentaires */}
          <div style={s.chatContainer}>
            {loading ? (
              <div style={s.loadingState}>Chargement...</div>
            ) : commentaires.length === 0 ? (
              <div style={s.emptyState}>
                <p style={{ fontSize: 36 }}>💬</p>
                <p style={{ color: "#9ca3af", fontSize: 14 }}>
                  Aucun commentaire pour cette tâche.<br />
                  Soyez le premier à commenter !
                </p>
              </div>
            ) : (
              <div style={s.messagesList}>
                {commentaires.map(c => (
                  <CommentaireBubble
                    key={c.id}
                    comment={c}
                    currentUserId={user?.user_id}
                  />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Zone saisie */}
          <div style={s.inputZone}>
            {/* Toggle visible client */}
            <div style={s.visibleToggle}>
              <label style={s.toggleLabel}>
                <input
                  type="checkbox"
                  checked={visibleClient}
                  onChange={e => setVisibleClient(e.target.checked)}
                  style={{ marginRight: 6 }}
                />
                👁️ Visible par le client
              </label>
            </div>

            <div style={s.inputRow}>
              <div style={s.inputAvatar}>
                {user?.prenom?.[0]?.toUpperCase() || "?"}
              </div>
              <textarea
                ref={inputRef}
                style={s.textarea}
                placeholder="Écrire un commentaire... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
                value={contenu}
                onChange={e => setContenu(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={sending}
              />
              <button
                style={{
                  ...s.sendBtn,
                  opacity: !contenu.trim() || sending ? 0.5 : 1,
                }}
                onClick={handleSend}
                disabled={!contenu.trim() || sending}
              >
                {sending ? "⏳" : "➤"}
              </button>
            </div>
            <p style={s.inputHint}>
              Entrée pour envoyer · Shift+Entrée pour nouvelle ligne
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", width: "100%", background: "#f0f4f8", fontFamily: "'Segoe UI', sans-serif", boxSizing: "border-box", overflowX: "hidden", display: "flex", flexDirection: "column" },
  layout: { display: "flex", flex: 1, minHeight: "calc(100vh - 70px)", width: "100%" },
  sidebar: { background: "#111827", color: "#fff", overflow: "hidden", transition: "all 0.25s ease", flexShrink: 0 },
  sidebarTitle: { margin: "0 0 12px", fontSize: 16, borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: 8 },
  menuList: { listStyle: "none", padding: 0, margin: 0 },
  menuItem: { padding: 10, borderRadius: 8, cursor: "pointer", marginBottom: 6, fontSize: 14, transition: "0.2s" },
  main: { flex: 1, padding: 24, minWidth: 0, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 16 },
  topBar: { display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" },
  backBtn: { background: "#f3f4f6", border: "1px solid #d1d5db", color: "#374151", padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" },
  pageTitle: { margin: 0, fontSize: 22, color: "#0f172a" },
  tacheTitre: { fontSize: 18, color: "#6b7280", fontWeight: 500 },
  pageSubtitle: { margin: "4px 0 0", color: "#6b7280", fontSize: 14 },
  alertError: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 14 },
  chatContainer: { flex: 1, background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", minHeight: 300, maxHeight: "calc(100vh - 340px)", overflowY: "auto", padding: 20 },
  loadingState: { textAlign: "center", padding: 40, color: "#9ca3af" },
  emptyState: { textAlign: "center", padding: "60px 20px" },
  messagesList: { display: "flex", flexDirection: "column" },
  avatar: { width: 36, height: 36, borderRadius: "50%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 },
  bubble: { padding: "10px 14px", fontSize: 14 },
  inputZone: { background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "14px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  visibleToggle: { marginBottom: 10 },
  toggleLabel: { display: "inline-flex", alignItems: "center", fontSize: 13, color: "#374151", cursor: "pointer", fontWeight: 500 },
  inputRow: { display: "flex", gap: 10, alignItems: "flex-end" },
  inputAvatar: { width: 36, height: 36, borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, flexShrink: 0 },
  textarea: { flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid #d1d5db", fontSize: 14, outline: "none", resize: "none", fontFamily: "'Segoe UI', sans-serif", lineHeight: 1.5 },
  sendBtn: { width: 44, height: 44, borderRadius: "50%", background: "#2563eb", color: "#fff", border: "none", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "opacity 0.2s" },
  inputHint: { margin: "8px 0 0", fontSize: 11, color: "#9ca3af" },
};