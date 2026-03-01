import cron from "node-cron";
import { verifierMaintenance } from "./regle_de_maintenance.js";

// Exécution immédiate au lancement
console.log("Lancement initial de la vérification des maintenances date le fichier de planification...");
verifierMaintenance();

cron.schedule("0 * * * *", () => {
  console.log("Vérification automatique des maintenances...");
  verifierMaintenance();
});

