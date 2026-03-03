import React from "react";
import "./Header.css";

const Header = ({ onLogout, onToggleMenu }) => {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <button
          className="menu-btn"
          onClick={onToggleMenu}
          aria-label="Ouvrir le menu"
        >
          ☰ Menu
        </button>

        {/* <button className="logout-btn" onClick={onLogout}>
          Déconnexion
        </button> */}
      </div>

      <div className="app-header-right">
        <img
          src="/logo-smartgarage.png"
          alt="Logo SmartGarage"
          className="header-logo"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.nextSibling;
            if (fallback) fallback.style.display = "flex";
          }}
        />
        <div className="header-logo-fallback">SG</div>


      <button className="logout-btn" onClick={onLogout}>
          Déconnexion
        </button>
      </div>
    </header>
  );
};

export default Header;