// import React from "react";
// import Login from "./pages/login";

// function App() {
//   return <Login />;
// } 

// export default App;


import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/login"; // Assurez-vous que le chemin est correct
import Dashboard from "./pages/Dashboard"; // crea este componente si no existe

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;