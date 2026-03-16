import { supabaseAdmin } from "./supabaseAdmin.js";

export function requireRole(allowedRoles = []) {
  return async (req, res, next) => {
    const { data: profile, error } = await supabaseAdmin
      .from("utilisateurs")
      .select("role")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error) return res.status(400).json({ error: error.message });
    if (!profile) return res.status(404).json({ error: "Profil introuvable" });

    if (!allowedRoles.includes(profile.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.role = profile.role;
    next();
  };
}