import cron from "node-cron";
import { verifier_rdv } from "./regle_rappel_rdv.js";

// Exécution immédiate au lancement
console.log("Lancement initial de la vérification des rappels de rendez-vous...");
verifier_rdv();

cron.schedule("0 8 * * *", () => {
  console.log("Vérification automatique des rappels de rendez-vous...");
  verifier_rdv();
});

