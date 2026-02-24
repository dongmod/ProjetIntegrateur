import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAccess = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData?.session?.user) {
          if (mounted) {
            setAllowed(false);
            setChecking(false);
          }
          return;
        }

        const userId = sessionData.session.user.id;

        const { data: profile, error: profileError } = await supabase
          .from("utilisateurs")
          .select("role, user_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (profileError || !profile) {
          if (mounted) {
            setAllowed(false);
            setChecking(false);
          }
          return;
        }

        const rolesAutorises = ["gestionnaire", "employe"];
        const isAllowed = rolesAutorises.includes(profile.role);

        if (mounted) {
          setAllowed(isAllowed);
          setChecking(false);
        }
      } catch (err) {
        if (mounted) {
          setAllowed(false);
          setChecking(false);
        }
      }
    };

    checkAccess();

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) {
    return <p style={{ padding: "1rem" }}>Chargement...</p>;
  }

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;