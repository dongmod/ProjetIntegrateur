import cron from "node-cron";
import  { verifierCapteursInactifs } from "./regle_capteur_inactif.js";

// Exécution immédiate au lancement
console.log("Lancement initial de la vérification des capteurs inactifs...");
verifierCapteursInactifs();

cron.schedule("0 8 * * *", () => {
  console.log("Vérification automatique de l'activité des capteurs...");
  verifierCapteursInactifs();
});

