import supabase from '../config/supabaseClient.js'
import { io } from "../server.js";
import { confirmationEmail } from '../utils/confirmationrdv.js';
import { notificatiordvtermine } from '../utils/notificatiordvtermine.js';
export const createRendezVous = async (req, res) => {
  const userId = req.user.id
  const { vehicule_id, garage_id, date_rendezvous, type_service } = req.body
console.log("REQ.USER =", req.user);
  try {
    // véhicule appartient au client
    const { data: vehicule, error: vehiculeError } = await supabase
      .from('vehicules')
      .select('*')
      .eq('id', vehicule_id)
      .eq('client_id', userId)
      .single()
console.log("vehicule =", vehicule_id);
console.log("garage =", garage_id);
console.log("da =", date_rendezvous);
console.log("userId =", userId);
console.log("service =", type_service);
    if (vehiculeError || !vehicule) {
      return res.status(403).json({ message: "Véhicule invalide pour ce client" })
    }

    //  conflit horaire
    const { data: conflit } = await supabase
      .from('rendez_vous')
      .select('*')
      .eq('garage_id', garage_id)
      .eq('date_rendezvous', date_rendezvous)

    if (conflit.length > 0) {
      return res.status(400).json({ message: "Créneau déjà réservé" })
    }

//verifier si rendez vous existe pour ce vehicule et ce garage à cette date
    const { data: existingRdv } = await supabase
      .from('rendez_vous')
      .select('*')
      .eq('vehicule_id', vehicule_id)
      //.eq('garage_id', garage_id)
      .eq("statut", "planifie")
      .eq('date_rendezvous', date_rendezvous)

    if (existingRdv && existingRdv.length > 0) {
      return res.status(400).json({ message: "Rendez-vous déjà existant pour ce véhicule et ce garage à cette date" })
    }else {
      console.log("Aucun rendez-vous existant pour ce véhicule et ce garage à cette date, création possible.")
    
    // insérer rendez-vous
    const { data, error } = await supabase
      .from('rendez_vous')
      .insert([{  vehicule_id,  garage_id,  date_rendezvous,  type_service,  statut: 'planifie'}])
      .select()
// mise a jou du socket dasboard rendez-vous
io.emit("rdv:update", {
  type: "created",
  data: data[0]
});

      //notifier client par email (à faire)
     const { data: userrdv } = await supabase
      .from('utilisateurs')
      .select('*')
      .eq('user_id', vehicule.client_id)
      .single()
      

  if (error) return res.status(400).json(error)
      await confirmationEmail(userrdv.email, type_service, date_rendezvous)
      
 if (error) {
      return res.status(400).json(error)
    }

    res.status(201).json({
      message: "Rendez-vous créé avec succès",
      rendez_vous: data
    })
    
    
    }




  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", err })
  }
}
export const getMesRendezVous = async (req, res) => {
  const userId = req.user.id

  const { data, error } = await supabase
    .from('rendez_vous')
    .select(`
      *,
      vehicules (
        marque,
        modele,
        plaque
      )
    `)
    .in('vehicule_id',
      (
        await supabase
          .from('vehicules')
          .select('id')
          .eq('client_id', userId)
      ).data.map(v => v.id)
    )

  if (error) return res.status(400).json(error)

  res.json(data)
}
export const deleteRendezVous = async (req, res) => {
  const rdvId = req.params.id



   //recuperer la date du rendez-vous pour la notification
   const { data: rdv } = await supabase
   .from('rendez_vous')
   .select('date_rendezvous')
   .eq('id', rdvId)
   .single()
    if (rdvError || !rdv) {
      return res.status(404).json({ message: "Rendez-vous introuvable" })
    }
    const now = new Date()
    const rdvDate = new Date(rdv.date_rendezvous)

    if (rdvDate - now < 24 * 60 * 60 * 1000) {
      return res.status(400).json({ message: "Impossible d'annuler un rendez-vous à moins de 24h de l'heure prévue" })
    }


  const { error } = await supabase
    .from('rendez_vous')
    .delete()
    .eq('id', rdvId)
    
// mise a jou du socket dasboard rendez-vous
io.emit("rdv:update", {
  type: "deleted",
  id: rdvId
});


  if (error) return res.status(400).json(error)

  res.json({ message: "Rendez-vous supprimé" })
}

export const updateRendezVous = async (req, res) => {
  const rdvId = req.params.id
  const { date_rendezvous, type_service, statut } = req.body


const { data: rdvupdate } = await supabase 
   .from('rendez_vous')
   .select('date_rendezvous')
   .eq('id', rdvId)
   .single()
    if ( !rdvupdate) {
      return res.status(404).json({ message: "Rendez-vous introuvable" })
    }
    const now = new Date()
    const rdvDateupdate = new Date(rdvupdate.date_rendezvous)

    if (rdvDateupdate - now < 24 * 60 * 60 * 1000) {
      return res.status(400).json({ message: "Impossible de modifier un rendez-vous à moins de 24h de l'heure prévue" })
    }


  const { data, error } = await supabase
    .from('rendez_vous')
    .update({ date_rendezvous, type_service, statut })
    .eq('id', rdvId)
    .select()
// mise a jou du socket dasboard rendez-vous
io.emit("rdv:update", {
  type: "updated",
  id: rdvId,
  data: data[0]
});
  if (error) return res.status(400).json(error)

  res.json(data[0])
}





//////terminer rendez-vous

export async function terminerRendezVous(rendezvous_id) {
  try {
console.log(" transmission pour notif:", rendezvous_id);
    // 1) Vérifier que le rendez-vous existe 
    const { data: rdv, error } = await supabase
      .from("rendez_vous")
      .select("id, statut,vehicule_id")
      .eq("id", rendezvous_id)
      .single();

    if (error || !rdv) {
      return { success: false, code: 404, message: "Rendez-vous n'existe pas" };
     }
/*
    // 2) Vérifier que le statut permet la transition
    if (rdv.statut == "planifie") {
          return { success: false, code: 400, message: "Ce rendez-vous ne peut pas être terminé" };
    }else 
      if (rdv.statut == "termine") {      return { success: false, code: 400, message: "Ce rendez-vous est déjà terminé" };
     }

*/
    // Récupérer les infos du client pour la notification
    const { data: userrdv } = await supabase
      .from('vehicules')
      .select('id, client_id')
      .eq('id', rdv.vehicule_id)
      .single()
   // Récupérer les infos du client pour la notification
    const { data: userrdv2 } = await supabase
      .from('utilisateurs')
      .select('email')
      .eq('user_id', userrdv.client_id)
      .single()
    

    // 4) Notification (email, MQTT, etc.)
    await notificatiordvtermine(userrdv2.email)
   // mettre a jour la table des notifications pour le client
    await supabase
      .from("notifications")
      .insert({
        utilisateur_id: userrdv.client_id,
        message: "Votre rendez-vous est terminé. Vous pouvez venir récupérer votre véhicule.",
        type: "mail",
        created_at: new Date().toISOString()
      })
    return { success: true, message: "Rendez-vous marqué comme terminé" };


  } catch (err) {
    console.log("ERREUR SERVEUR:", err);
    return { success: false, code: 500, message: "Erreur serveur" };

  }
};



