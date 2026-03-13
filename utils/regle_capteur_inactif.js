// regle_capteur_inactif.js
import supabase from "../config/supabaseClient.js";
import { client } from  "../mqtt/mqttClient.js";
import { mailcapteurinactif } from "./mail_capteur_inactif.js";
const log = {
  info: (...msg) => console.log("[INFO]", ...msg),
  warn: (...msg) => console.warn("[WARN]", ...msg),
  error: (...msg) => console.error("[ERROR]", ...msg),
};

export async function verifierCapteursInactifs() {
  const cinqMinutes = 5 * 60 * 1000;
  const maintenant = Date.now();

  const { data: capteurs, error } = await supabase
    .from("capteurs")
    .select("id, identifiant_materiel, derniere_mise_a_jour");

  if (error) {
    log.error("Erreur récupération capteurs :", error);
    return;
  }

for (const capteur of capteurs) {
    const lastUpdate = new Date(capteur.derniere_mise_a_jour).getTime();

    if (maintenant - lastUpdate > cinqMinutes) {
      log.warn(
        ` Capteur ${capteur.id} (${capteur.identifiant_materiel}) inactif depuis plus de 5 minutes`
      );

      // ---------------- MQTT ----------------
      client.publish(
        "garage/alertes",
        JSON.stringify({
          type: "capteur_inactif",
          capteur_id: capteur.id,
          nom: capteur.identifiant_materiel,
          depuis: cinqMinutes,
        })
      );

      // ---------------- EMAIL ----------------
     mailcapteurinactif("mariusdogmo@gmail.com", capteur.identifiant_materiel);
      log.warn(`Email d'alerte envoyé pour capteur ${capteur.identifiant_materiel}`);


    }
  };
}
