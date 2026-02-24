import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";


const Login = () => {
  const [email, setEmail] = useState("");
  const [mot_de_passe, setMotDePasse] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);



  useEffect(() => {
    const testConnexion = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log("SESSION DATA:", data);
      console.log("SESSION ERROR:", error);

      const { data: testData, error: testError } = await supabase
        .from("utilisateurs")
        .select("nom, prenom, role, user_id")
        .limit(1);

      console.log("TEST UTILISATEURS DATA:", testData);
      console.log("TEST UTILISATEURS ERROR:", testError);
    };

    testConnexion();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      // 1) Auth login
      const cleanEmail = email.trim().toLowerCase();

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: mot_de_passe,
        });

      console.log("LOGIN EMAIL:", cleanEmail);
      console.log("LOGIN PASSWORD LENGTH:", mot_de_passe.length);
      console.log("AUTH DATA:", authData);
      console.log("AUTH ERROR FULL:", authError);

      if (authError) {
        // console.error("AUTH ERROR OBJECT:", authError);      
        // console.error("AUTH ERROR MESSAGE:", authError.message);
        // console.error("AUTH ERROR STATUS:", authError.status);
        // setErrorMessage(authError.message);
        setErrorMessage(authError.message || "Email ou mot de passe incorrects");
        return;
      }

      if (!authData?.user) {
        setErrorMessage("Utilisateur non trouvé dans authentification");
        return;
      }

      // 2) Obtenir l'identifiant utilisateur APRÈS la connexion
      const userId = authData.user.id;
      console.log("AUTH USER ID:", userId);

      // 3) Rechercher un profil dans le tableau utilisateurs
      const { data: profile, error: profileError } = await supabase
        .from("utilisateurs")
        .select("nom, prenom, role, user_id")
        .eq("user_id", userId)
        .maybeSingle();

      console.log("PROFILE DATA:", profile);
      console.log("PROFILE ERROR:", profileError);

      if (profileError) {
        setErrorMessage(`Erreur profil: ${profileError.message}`);
        return;
      }

      if (!profile) {
        setErrorMessage("Profil non trouvé dans la table utilisateurs");
        return;
      }

      // 4) Personnel autorisé uniquement (gestionnaire + employé)
      const rolesAutorises = ["gestionnaire", "employe"];

      if (!rolesAutorises.includes(profile.role)) {
        setErrorMessage("Accès réservé au personnel");
        return;
      }

      // 5) Accès OK (même portail pour les employés/gestionnaires)
      alert(`Bienvenue ${profile.prenom} (${profile.role})`);


    } catch (err) {
      console.error("Erreur INATTENDUE:", err);
      setErrorMessage(err?.message || "Une erreur inattendue s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      alert("Entre ton email d'abord");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        // ===  Remplacez ceci par votre URL réelle et ajoutez-la dans Supabase > Authentication > URL Configuration. ====== 
        redirectTo: "http://localhost:5173/update-password",
      });

      if (error) {
        console.error("RESET ERROR:", error);
        alert(error.message);
        return;
      }

      alert("Email de récupération envoyé ");
    } catch (err) {
      console.error("RESET INATTENDUE:", err);
      alert(err?.message || "Erreur lors de l'envoi de l'email");
    }
  };

  const handleTestConnexion = async () => {
    const { data, error } = await supabase.auth.getSession();
    console.log("SESSION DATA:", data);
    console.log("SESSION ERROR:", error);

    if (!error) {
      alert("Supabase répond correctement");
    } else {
      alert("Erreur lors de la connexion à Supabase");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        <h1>SmartGarage Employee</h1>
        <p>Votre garage, plus intelligent chaque jour</p>

        <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
          <div style={{ marginBottom: "1rem", textAlign: "left" }}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: "100%",
                padding: "0.75rem",
                marginTop: "0.25rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem", textAlign: "left" }}>
            <label htmlFor="mot_de_passe">Mot de passe</label>
            <input
              type="password"
              id="mot_de_passe"
              placeholder="••••••••"
              value={mot_de_passe}
              onChange={(e) => setMotDePasse(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "0.75rem",
                marginTop: "0.25rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          {errorMessage && (
            <div
              style={{
                color: "#c62828",
                backgroundColor: "#ffebee",
                border: "1px solid #ef9a9a",
                borderRadius: "6px",
                padding: "0.75rem",
                marginBottom: "1rem",
                textAlign: "left",
                fontSize: "0.9rem",
              }}
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: loading ? "#90caf9" : "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>



        <button
          type="button"
          onClick={handleResetPassword}
          style={{
            marginTop: "0.75rem",
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#fff",
            color: "#333",
            border: "1px solid #ccc",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.95rem",
          }}
        >
          Mot de passe oublié ?
        </button>

        <div style={{ marginTop: "1rem" }}>

          <p style={{ fontSize: "0.9rem" }}>
            <a href="#">← Retour à l'accueil</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
