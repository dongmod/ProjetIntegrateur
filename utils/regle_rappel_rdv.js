

import { diff } from 'semver';
import supabase from '../config/supabaseClient.js';
import { rappelrdv } from './rappel_rdv.js';
import { no } from 'zod/v4/locales';

export const verifier_rdv = async () => {
  const { data: rdvs,error } = await supabase
  .from("rendez_vous")
  .select("*")
  .eq("statut", "planifie") // On ne vérifie que les rendez-vous programmés
   console.log(`Vérification des rendez-vous programmés : ${rdvs.length} trouvés.`);
  //diffrence en heures entre la date du rendez-vous et la date actuelle
  if (error) {
  console.error(" Erreur Supabase :", error);
  return;
}

if (!rdvs || rdvs.length === 0) {
  console.log("Aucun rendez-vous planifié trouvé.");
  return;
}

  
  const differenceEnHeures = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1);
    return Math.floor(diffTime / (1000 * 60 * 60));
  }
//retrouver le client_id et le type de service pour chaque rendez-vous
 
   for (const rdv of rdvs) {
        const { data: vehicule,error: vehiculeError  } = await supabase
      .from("vehicules")
      .select("*")
      .eq("id", rdv.vehicule_id);
  if (vehiculeError) {
      console.error(" Erreur Supabase (vehicule) :", vehiculeError);
      continue;
    }

    if (!vehicule || vehicule.length === 0) {
      console.log(` Aucun véhicule trouvé pour le rendez-vous ${rdv.id}`);
      continue;
    }

    const veh = vehicule[0];

        const heuresAvantRdv = differenceEnHeures(new Date(), new Date(rdv.date_rendezvous));
//console.log(`Rendez-vous ${veh.client_id} - Heures avant le rendez-vous: ${heuresAvantRdv}`);
      if (heuresAvantRdv <= 24) { // Exemple : rappel 24 heures avant
       // console.log(`Notification créée pour le rendez-vous ${rdv.id} : ${rdv.type_service}`);
        await rappelrdv(veh.marque,veh.plaque, rdv.type_service, veh.client_id);
      }
    }
  };