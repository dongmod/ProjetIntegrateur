import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Dashboard from "./pages/Admin/Dashboard";
import DashboardEmploye from "./pages/Employe/DashboardEmploye";
import ProtectedRoute from "./components/ProtectedRoute";
import Utilisateurs from "./pages/Admin/Utilisateurs";
import CalendrierRDV from "./pages/Admin/CalendrierRDV";
import MesRendezVousEmploye from "./pages/Employe/MesRDVEmploye";
import GestionCreneaux from "./pages/Admin/GestionCreneaux";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      {/* Dashboard pour les gestionnaires */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["gestionnaire"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Dashboard pour les employés */}
      <Route
        path="/dashboard-employe"
        element={
          <ProtectedRoute allowedRoles={["employe"]}>
            <DashboardEmploye />
          </ProtectedRoute>
        }
      />

      {/* Route pour la gestion des utilisateurs */}
      <Route
        path="/utilisateurs"
        element={
          <ProtectedRoute allowedRoles={["gestionnaire"]}>
            <Utilisateurs />
          </ProtectedRoute>
        }
      />

      {/* Route pour le calendrier des rendez-vous */}
      <Route
        path="/calendrier-rdv"
        element={
          <ProtectedRoute allowedRoles={["gestionnaire", "employe"]}>
            <CalendrierRDV />
          </ProtectedRoute>
        }
      />

      {/* Route pour l'employé et ses rendez-vous assignés */}
      <Route
        path="/mes-rendez-vous-employe"
        element={
          <ProtectedRoute allowedRoles={["employe"]}>
            <MesRendezVousEmploye />
          </ProtectedRoute>
        }
      />
    


    <Route 
    path="/creneaux"
    element={ 
      <ProtectedRoute allowedRoles={["gestionnaire"]}>
        <GestionCreneaux/>
      </ProtectedRoute>
    }
/>

</Routes> 
  );
}
export default App;

