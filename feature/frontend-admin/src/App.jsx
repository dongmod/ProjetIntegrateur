import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";   // ← CORRECT
import DashboardEmploye from "./pages/DashboardEmploye";   
import ProtectedRoute from "./components/ProtectedRoute";
import Utilisateurs from "./pages/Utilisateurs"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

// Dashboard pour les gestionnaires
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["gestionnaire"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      //Dashboard pour les employés
      <Route
        path="/dashboard-employe"
        element={
          <ProtectedRoute allowedRoles={["employe"]}>
            <DashboardEmploye />
          </ProtectedRoute>
        }
      />

      // Route pour la gestion des utilisateurs (accessible uniquement aux gestionnaires)
      <Route
        path="/utilisateurs"
        element={
          <ProtectedRoute allowedRoles={["gestionnaire"]}>
            <Utilisateurs />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

