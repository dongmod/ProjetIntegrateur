//Notes: 
// =====Fonction pour faire les appels a Backend avec JWT ======
// === Neccesaire pour sécuriser les routes protégées du frontend et vérifier les permissions d'accès ====
//===apiFetch() est une fonction utilitaire qui ajoute automatiquement le token d'authentification à chaque requête vers l'API backend, et gère les erreurs de manière centralisée. ===

// const API_URL = import.meta.env.VITE_API_URL;

// export async function apiFetch(path, options = {}) {
//   if (!API_URL) {
//     throw new Error("VITE_API_URL not define in .env (frontend)");
//   }


//   const token = localStorage.getItem("token");   //JWT del backend 
//   console.log("API_FETCH TOKEN:", token);

//   const headers = {
//     "Content-Type": "application/json",
//     ...(options.headers || {}),
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
//   const res = await fetch(`${API_URL}${path}`, {
//     ...options,
//     headers,
//   });


//   // const res= await fetch("http://localhost:3001/api/auth/login", {
//   //       method: "GET",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`, 
//   //       },
//   //     });

//   // const res = await fetch(`${API_URL}${path}`, { 
//   //   ...options, headers });

//   const ct = res.headers.get("content-type") || "";
//   const isJson = ct.includes("application/json");

//   if (!res.ok) {
//     // intenta leer JSON de error
//     if (isJson) {
//       const msg =  
//         (isJson && (body?.message || body?.error)) ||
//         (typeof body === "string" && body) ||
//         `HTTP ${res.status}`;
//       throw new Error(msg);
//     }
//     return body;
//   }

// //   if (isJson) {
// //     return await res.json().catch(() => null);
// //   }
// //   return await res.text().catch(() => null);
// // }

const API_URL = import.meta.env.VITE_API_URL; // ej: http://localhost:3001

export async function apiFetch(path, options = {}) {
  if (!API_URL) {
    throw new Error("VITE_API_URL not defined in .env (frontend)");
  }

  const token = localStorage.getItem("token");
  console.log("API_FETCH TOKEN:", token);

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");

  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const msg =
      (body && typeof body === "object" && (body.message || body.error)) ||
      (typeof body === "string" && body) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return body;
}