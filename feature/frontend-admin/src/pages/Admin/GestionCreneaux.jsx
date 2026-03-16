import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useNavigate } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL;


const JOURS = [
  { label: "Lundi",     value: 0 },
  { label: "Mardi",     value: 1 },
  { label: "Mercredi",  value: 2 },
  { label: "Jeudi",     value: 3 },
  { label: "Vendredi",  value: 4 },
  { label: "Samedi",    value: 5 },
  { label: "Dimanche",  value: 6 },
];

// Génère les prochains 14 jours
function getNext14Days() {
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export default function GestionCreneaux() {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");
  const authH    = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const [menuOpen,  setMenuOpen]  = useState(true);
  const [garage,    setGarage]    = useState(null);
  const [services,  setServices]  = useState([]);
  const [postes,    setPostes]    = useState([]);
  const [employes,  setEmployes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  // Simulateur de créneaux
  const [simDate,       setSimDate]       = useState(getNext14Days()[1]);
  const [simServiceId,  setSimServiceId]  = useState("");
  const [simSlots,      setSimSlots]      = useState([]);
  const [simLoading,    setSimLoading]    = useState(false);

  // Horaires garage (édition)
  const [horaires, setHoraires] = useState({
    heure_ouverture: "09:00",
    heure_fermeture: "18:00",
  });
  const [savingHoraires, setSavingHoraires] = useState(false);

  useEffect(() => {
    if (!token) return navigate("/", { replace: true });
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [garageRes, servicesRes, postesRes, empRes] = await Promise.all([
        fetch(`${API_URL}/api/garages`, { headers: authH }),
        fetch(`${API_URL}/api/services`, { headers: authH }),
        fetch(`${API_URL}/api/posteTravail`, { headers: authH }),
        fetch(`${API_URL}/api/auth/getUser`, { headers: authH }),
      ]);

      const garageData   = garageRes.ok   ? await garageRes.json()   : null;
      const servicesData = servicesRes.ok ? await servicesRes.json() : [];
      const postesData   = postesRes.ok   ? await postesRes.json()   : [];
      const empData      = empRes.ok      ? await empRes.json()      : [];

      // Supabase peut retourner un tableau ou un objet selon la route
      const g = Array.isArray(garageData) ? garageData[0] : garageData;
      setGarage(g);
      if (g?.heure_ouverture) {
        setHoraires({
          heure_ouverture: g.heure_ouverture.slice(0, 5),
          heure_fermeture: g.heure_fermeture.slice(0, 5),
        });
      }

      setServices(servicesData);
      setPostes(postesData);
      setEmployes(empData.filter(u => u.role === "employe"));
    } catch (e) {
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder horaires garage
  const handleSaveHoraires = async () => {
    if (!garage?.id) return setError("Garage introuvable");
    setSavingHoraires(true);
    try {
      const res = await fetch(`${API_URL}/api/garages/${garage.id}`, {
        method: "PUT",
        headers: authH,
        body: JSON.stringify(horaires),
      });
      if (!res.ok) throw new Error("Erreur sauvegarde");
      setSuccess("Horaires mis à jour ✅");
      setTimeout(() => setSuccess(""), 3000);
      fetchAll();
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingHoraires(false);
    }
  };

  // Simuler les créneaux disponibles
  const handleSimuler = async () => {
    if (!simServiceId || !simDate) return setError("Sélectionnez une date et un service");
    setSimLoading(true);
    setSimSlots([]);
    setError("");
    try {
      const res = await fetch(
        `${API_URL}/api/crenaux?date=${simDate}&service_id=${simServiceId}`,
        { headers: authH }
      );
      const data = res.ok ? await res.json() : [];
      setSimSlots(data);
    } catch (e) {
      setError("Impossible de charger les créneaux.");
    } finally {
      setSimLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  // Stats
  const totalSlotsDuJour = simSlots.length;
  const heuresOuverture = garage
    ? timeToMinutes(garage.heure_fermeture?.slice(0,5)) - timeToMinutes(garage.heure_ouverture?.slice(0,5))
    : 0;

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
                  ["🏠", "Tableau de bord",    "/dashboard"],
                  ["📅", "Rendez-vous",         "/rendez-vous"],
                  ["✅", "Tâches",              "/taches"],
                  ["👥", "Utilisateurs",        "/utilisateurs"],
                  ["🕐", "Créneaux",            "/crenaux"],
                  ["🛠️", "Services",            "/services"],
                  ["🚗", "Véhicules",           "/vehicules"],
                  ["🔔", "Notifications",       "/notifications"],
                  ["⚙️", "Paramètres",          "/parametres"],
                ].map(([icon, label, path]) => (
                  <li key={path} style={{
                    ...s.menuItem,
                    background: path === "/crenaux"
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
              <h1 style={s.pageTitle}>🕐 Gestion des Créneaux</h1>
              <p style={s.pageSubtitle}>
                Configurez les horaires du garage et visualisez la disponibilité
              </p>
            </div>
          </div>

          {error   && <div style={s.alertError}>{error}</div>}
          {success && <div style={s.alertSuccess}>{success}</div>}

          {loading ? (
            <p style={{ color: "#6b7280", padding: 20 }}>Chargement...</p>
          ) : (
            <div style={s.grid}>

              {/* ── Carte 1 : Horaires du garage ── */}
              <div style={s.card}>
                <h2 style={s.cardTitle}>🏪 Horaires du garage</h2>
                <p style={s.cardSubtitle}>
                  {garage?.nom || "Garage"} — ces horaires définissent les créneaux disponibles
                </p>

                <div style={s.formRow}>
                  <div style={s.fg}>
                    <label style={s.label}>Heure d'ouverture</label>
                    <input
                      type="time" style={s.input}
                      value={horaires.heure_ouverture}
                      onChange={e => setHoraires(p => ({ ...p, heure_ouverture: e.target.value }))}
                    />
                  </div>
                  <div style={s.fg}>
                    <label style={s.label}>Heure de fermeture</label>
                    <input
                      type="time" style={s.input}
                      value={horaires.heure_fermeture}
                      onChange={e => setHoraires(p => ({ ...p, heure_fermeture: e.target.value }))}
                    />
                  </div>
                </div>

                <div style={s.infoRow}>
                  <span style={s.infoBadge}>
                    ⏱️ {Math.floor(heuresOuverture / 60)}h{heuresOuverture % 60 > 0 ? heuresOuverture % 60 + "min" : ""} d'ouverture
                  </span>
                  <span style={s.infoBadge}>
                    🔧 {postes.length} poste{postes.length > 1 ? "s" : ""} de travail
                  </span>
                  <span style={s.infoBadge}>
                    👷 {employes.length} employé{employes.length > 1 ? "s" : ""}
                  </span>
                </div>

                <button
                  style={s.saveBtn}
                  onClick={handleSaveHoraires}
                  disabled={savingHoraires}
                >
                  {savingHoraires ? "Sauvegarde..." : "💾 Sauvegarder les horaires"}
                </button>
              </div>

              {/* ── Carte 2 : Postes de travail ── */}
              <div style={s.card}>
                <h2 style={s.cardTitle}>🔧 Postes de travail</h2>
                <p style={s.cardSubtitle}>
                  {postes.length} poste{postes.length > 1 ? "s" : ""} disponible{postes.length > 1 ? "s" : ""} en parallèle
                </p>
                <div style={s.posteList}>
                  {postes.length === 0 ? (
                    <p style={{ color: "#9ca3af", fontSize: 14 }}>Aucun poste configuré</p>
                  ) : postes.map((p, i) => (
                    <div key={p.id} style={s.posteItem}>
                      <span style={s.posteDot}>{i + 1}</span>
                      <span style={s.posteNom}>{p.nom}</span>
                      <span style={{ ...s.infoBadge, fontSize: 11 }}>Actif</span>
                    </div>
                  ))}
                </div>
                <p style={s.noteText}>
                  💡 Le nombre de postes détermine combien de RDV peuvent se dérouler en parallèle.
                  Gérez les postes depuis la section <strong>Paramètres</strong>.
                </p>
              </div>

              {/* ── Carte 3 : Employés ── */}
              <div style={s.card}>
                <h2 style={s.cardTitle}>👷 Employés disponibles</h2>
                <p style={s.cardSubtitle}>
                  {employes.length} employé{employes.length > 1 ? "s" : ""} dans votre équipe
                </p>
                <div style={s.posteList}>
                  {employes.length === 0 ? (
                    <p style={{ color: "#9ca3af", fontSize: 14 }}>Aucun employé enregistré</p>
                  ) : employes.map(emp => (
                    <div key={emp.user_id} style={s.posteItem}>
                      <span style={{ ...s.posteDot, background: "#10b981" }}>
                        {emp.prenom?.[0]}{emp.nom?.[0]}
                      </span>
                      <span style={s.posteNom}>{emp.prenom} {emp.nom}</span>
                      <span style={{ ...s.infoBadge, background: "#d1fae5", color: "#065f46", fontSize: 11 }}>
                        Employé
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Carte 4 : Services & durées ── */}
              <div style={s.card}>
                <h2 style={s.cardTitle}>🛠️ Services & durées</h2>
                <p style={s.cardSubtitle}>Durée de chaque service — impacte les créneaux disponibles</p>
                <div style={s.posteList}>
                  {services.length === 0 ? (
                    <p style={{ color: "#9ca3af", fontSize: 14 }}>Aucun service configuré</p>
                  ) : services.map(srv => (
                    <div key={srv.id} style={s.posteItem}>
                      <span style={{ ...s.posteDot, background: "#6366f1", fontSize: 11 }}>
                        {srv.duree || "?"}m
                      </span>
                      <span style={s.posteNom}>{srv.nom}</span>
                      <span style={{ ...s.infoBadge, fontSize: 11 }}>
                        {srv.duree ? `${srv.duree} min` : "Durée non définie"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Carte 5 : Simulateur créneaux ── */}
              <div style={{ ...s.card, gridColumn: "1 / -1" }}>
                <h2 style={s.cardTitle}>🔍 Simulateur de créneaux disponibles</h2>
                <p style={s.cardSubtitle}>
                  Visualisez les créneaux disponibles pour un service et une date donnés
                </p>

                <div style={s.simControls}>
                  <div style={s.fg}>
                    <label style={s.label}>Date</label>
                    <input
                      type="date" style={s.input}
                      value={simDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={e => setSimDate(e.target.value)}
                    />
                  </div>
                  <div style={s.fg}>
                    <label style={s.label}>Service</label>
                    <select style={s.input} value={simServiceId}
                      onChange={e => setSimServiceId(e.target.value)}>
                      <option value="">— Sélectionner —</option>
                      {services.map(srv => (
                        <option key={srv.id} value={srv.id}>
                          {srv.nom} ({srv.duree || "?"}min)
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    style={s.simBtn}
                    onClick={handleSimuler}
                    disabled={simLoading}
                  >
                    {simLoading ? "Calcul..." : "🔍 Simuler"}
                  </button>
                </div>

                {simSlots.length > 0 && (
                  <>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: "16px 0 10px" }}>
                      <strong>{totalSlotsDuJour} créneau{totalSlotsDuJour > 1 ? "x" : ""}</strong> disponible{totalSlotsDuJour > 1 ? "s" : ""} le {simDate}
                    </p>
                    <div style={s.slotsGrid}>
                      {simSlots.map((slot, i) => (
                        <div key={i} style={s.slotChip}>
                          <span style={s.slotTime}>{slot.debut}</span>
                          <span style={s.slotArrow}>→</span>
                          <span style={s.slotTime}>{slot.fin}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {!simLoading && simSlots.length === 0 && simServiceId && (
                  <div style={s.emptySlots}>
                    😔 Aucun créneau disponible pour cette date et ce service
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
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 10 },
  pageTitle: { margin: 0, fontSize: 24, color: "#0f172a" },
  pageSubtitle: { margin: "4px 0 0", color: "#6b7280", fontSize: 14 },
  alertError: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 14 },
  alertSuccess: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 14 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 },
  card: { background: "#fff", borderRadius: 14, padding: 22, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb" },
  cardTitle: { margin: "0 0 4px", fontSize: 17, color: "#0f172a", fontWeight: 700 },
  cardSubtitle: { margin: "0 0 18px", fontSize: 13, color: "#6b7280" },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 },
  fg: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: { padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  infoRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  infoBadge: { background: "#f3f4f6", color: "#374151", padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  saveBtn: { width: "100%", background: "#2563eb", color: "#fff", border: "none", padding: "10px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 },
  posteList: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 },
  posteItem: { display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" },
  posteDot: { width: 32, height: 32, borderRadius: "50%", background: "#2563eb", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 },
  posteNom: { flex: 1, fontSize: 14, fontWeight: 600, color: "#1f2937" },
  noteText: { fontSize: 12, color: "#9ca3af", lineHeight: 1.5, margin: 0 },
  simControls: { display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 8 },
  simBtn: { background: "#2563eb", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" },
  slotsGrid: { display: "flex", flexWrap: "wrap", gap: 10 },
  slotChip: { display: "flex", alignItems: "center", gap: 6, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 14px" },
  slotTime: { fontSize: 15, fontWeight: 700, color: "#1e40af" },
  slotArrow: { color: "#93c5fd", fontSize: 14 },
  emptySlots: { textAlign: "center", padding: "24px", color: "#9ca3af", fontSize: 14, background: "#f9fafb", borderRadius: 8, marginTop: 12 },
};