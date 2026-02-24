import React from "react";

const Header = ({ title = "SmartGarage", subtitle = "", onLogout }) => {
  return (
    <header
      style={{
        width: "100%",
        padding: "1rem 1.5rem",
        backgroundColor: "#1976d2",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxSizing: "border-box",
      }}
    >
      <div>
        <h1 style={{ margin: 0 }}>{title}</h1>
        {subtitle ? <p style={{ margin: 0 }}>{subtitle}</p> : null}
      </div>

      <button
        type="button"
        onClick={onLogout}
        style={{
          backgroundColor: "#fff",
          color: "#1976d2",
          border: "2px solid #1976d2",
          borderRadius: "6px",
          padding: "0.5rem 0.75rem",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Déconnexion
      </button>
    </header>
  );
};

export default Header;