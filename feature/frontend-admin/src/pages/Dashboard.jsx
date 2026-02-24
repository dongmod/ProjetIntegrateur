import React, {useEffect, useState} from "react";
import { supabase } from "../lib/supabase";

const Dashboard = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("SESSION DATA:", session);
      console.log("SESSION ERROR:", error);
      setSession(session);
    };

    getSession();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {session ? (
        <p>Bienvenue, vous êtes connecté !</p>
      ) : (
        <p>Vous n'êtes pas connecté.</p>
      )}
    </div>
  );
};

export default Dashboard; 
