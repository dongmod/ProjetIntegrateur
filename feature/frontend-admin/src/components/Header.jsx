// import React from "react";
// import "./Header.css";

// const Header = ({ onLogout, onToggleMenu }) => {
//   return (
//     <header className="app-header">
//       <div className="app-header-left">
//         <button
//           className="menu-btn"
//           onClick={onToggleMenu}
//           aria-label="Ouvrir le menu"
//         >
//           ☰ Menu
//         </button>

//         {/* <button className="logout-btn" onClick={onLogout}>
//           Déconnexion
//         </button> */}
//       </div>

//       <div className="app-header-right">
//         <img
//           src="/logo-smartgarage.png"
//           alt="Logo SmartGarage"
//           className="header-logo"
//           onError={(e) => {
//             e.currentTarget.style.display = "none";
//             const fallback = e.currentTarget.nextSibling;
//             if (fallback) fallback.style.display = "flex";
//           }}
//         />
//         <div className="header-logo-fallback">SG</div>


//       <button className="logout-btn" onClick={onLogout}>
//           Déconnexion
//         </button>
//       </div>
//     </header>
//   );
// };

// export default Header;




import React, { useEffect, useState } from "react";
import "./Header.css";

const API_URL = "http://localhost:3001";

const Header = ({ onLogout, onToggleMenu }) => {
  const [photo,    setPhoto]    = useState(null);
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const authH = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // 1) Récupérer l'utilisateur connecté
    fetch(`${API_URL}/api/auth/me`, { headers: authH })
      .then(r => r.ok ? r.json() : null)
      .then(me => {
        if (!me) return;
        const ini = `${me.prenom?.[0] || ""}${me.nom?.[0] || ""}`.toUpperCase();
        setInitials(ini);

        // 2) Récupérer le profil étendu pour la photo
        return fetch(`${API_URL}/api/profils/${me.user_id}`, { headers: authH })
          .then(r => r.ok ? r.json() : null)
          .then(profil => {
            if (profil?.photo_url) setPhoto(profil.photo_url);
          });
      })
      .catch(() => {});
  }, []);

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
        {/* <div className="header-logo-fallback">SG</div> */}

        {/* Avatar utilisateur */}
        <div className="header-avatar">
          {photo ? (
            <img
              src={photo}
              alt="avatar"
              className="header-avatar-img"
              onError={() => setPhoto(null)}
            />
          ) : (
            <div className="header-avatar-initials">{initials}</div>
          )}
        </div>

        <button className="logout-btn" onClick={onLogout}>
          Déconnexion
        </button>
      </div>
    </header>
  );
};

export default Header;