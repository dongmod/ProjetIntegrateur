import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";   // ← CORRECT
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["gestionnaire"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;

