

import { diff } from 'semver';
import supabase from '../config/supabaseClient.js';
import { creerNotification } from './rappel_maintenance.js';

export const verifierMaintenance = async () => {
  const { data: vehicules } = await supabase.from("vehicules").select("*");
 const differenceEnMois = (date1, date2) => {
        const diffTime = Math.abs(date2 - date1);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
      }
  for (const vehicule of vehicules) {
    const { data: regles } = await supabase
      .from("regle_maint")
      .select("*")
      .eq("vehicule_id", vehicule.id);
//console.log(`Vérification pour le véhicule ${vehicule.id} avec ${regles.length} règles de maintenance. avec ${vehicule.client_id} `);
    for (const regle of regles) {
      const kmDepuis = vehicule.kilometrage - vehicule.km_derniere_maint;
      //const moisDepuis = differenceEnMois(vehicule.derniere_maintenance_date, new Date());

     
   const moisDepuis = differenceEnMois(new Date(vehicule.date_derniere_maint), new Date());
//console.log(`Véhicule ${vehicule.id} - KM depuis dernière maintenance: ${kmDepuis}, Mois depuis dernière maintenance: ${moisDepuis}`);
      if (kmDepuis >= regle.interval_km || moisDepuis >= regle.interval_mois) {
        console.log(`Notification créée pour le véhicule ${vehicule.id} : ${regle.type}`);
        await creerNotification(vehicule.client_id, regle.type);
      }
    }
  }
};