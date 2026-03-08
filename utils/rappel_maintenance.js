import supabase from '../config/supabaseClient.js';
import { maintenacenitifEmail} from './notif_maintenance.js';


export const creerNotification = async (userId, typeMaintenance) => {
  console.log(`Création de notification pour l'utilisateur ${userId} concernant le type de maintenance: ${typeMaintenance}`);
  const { data, error } = await supabase.from("notifications").insert({
    utilisateur_id: userId,
    message: `Un entretien "${typeMaintenance}" est dû pour votre véhicule.`,
    type: "email",
    est_lu: false
  });
  //notification par email
    if (error) {
    console.error(" Erreur lors de l'insertion de la notification :", error);
    return;
  }

 await  maintenacenitifEmail(userId, typeMaintenance);
};