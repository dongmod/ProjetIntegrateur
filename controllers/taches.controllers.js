import e from 'express'
import supabase from '../config/supabaseClient.js'
import { debutreparation } from '../utils/notif_debut_reparation.js'; 
import { getIO } from "../websocket/socket.js";
import { terminerRendezVous } from './rendezvous.controller.js'





  const log = {
  info: (...msg) => console.log("[INFO]", ...msg),
  warn: (...msg) => console.warn("[WARN]", ...msg),
  error: (...msg) => console.error("[ERROR]", ...msg),
};

export const createTaches = async (req, res) => {
  console.log("BODY RECU POUR CREATION DE TACHE:",req.body)
  const { niveau_urgence,rendezvous_id,employe_id,poste_id,titre, description, statut, heure_debut, heure_fin} = req.body




  // Validation simple
  if (!titre || !description || !statut) {
    return res.status(400).json({
      message: "titre, description, statut, heure_debut et heure_fin sont obligatoires"
    })
  }

  try {
    const { data, error } = await supabase
      .from('taches')
      .insert([
        {
        rendezvous_id,
        employe_id,
        poste_id,
          titre,
          description,
          statut, 
            heure_debut,
            heure_fin,
            niveau_urgence: niveau_urgence || "moyenne"
        }
      ])
      .select()
      console.log("SUBAPASE ERROR",error) //>new 
      console.log("SUPABASE DATA:",data) ///>new 

    if (error) {
      return res.status(400).json({
        message: "Erreur lors de la création",
        error
      })
    }

    return res.status(201).json({
      message: "taches créé avec succès", tache:data[0],
      tache: data[0]
    })

  } catch (err) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    })
  }
}

export const getMesTaches = async (req, res) => {
  const userId = req.user.user_id
  console.log("GET MES TACHES - userId:", userId)

  const { data, error } = await supabase
    .from('taches')
    .select(`
      *,
      utilisateurs (
        nom,
        prenom
      ),
      postes_travail (
        nom,type_service,statut
      )
    `)
    .eq('employe_id', userId)
    console.log("TACHES DATA:", data)   // ← agrega
    console.log("TACHES ERROR:", error)

  if (error) return res.status(400).json(error)

  res.json(data)
}

export const updateTache = async (req, res) => {
  const tacheId = req.params.id
  const { statut, 
    heure_debut, 
    heure_fin,
    titre,
    description,
    niveau_urgence,
    employe_id,
    poste_id,
    rendezvous_id } = req.body

  const { data, error } = await supabase
    .from('taches')
    .update({ statut, heure_debut, heure_fin,titre,description,niveau_urgence,
      employe_id: employe_id    || null, 
      poste_id:      poste_id      || null,
      rendezvous_id: rendezvous_id || null,})
    .eq('id', tacheId)
    .select()

  if (error) return res.status(400).json(error)

  res.json(data[0])
}
export const deleteTache = async (req, res) => {
  const tacheId = req.params.id

  const { error } = await supabase
    .from('taches')
    .delete()
    .eq('id', tacheId)

  if (error) return res.status(400).json(error)

  res.json({ message: "Tâche supprimée" })
}


export const getAllTaches = async (req, res) => {
  const { data, error } = await supabase
    .from('taches')
    .select(`
      *,
      utilisateurs:employe_id (
        nom, prenom
      ),
      postes_travail:poste_id (
        nom, type_service, statut
      )
    `)
    .order('created_at', { ascending: false })

  if (error) return res.status(400).json(error)
  res.json(data)
}




// commencer une tache et le rendez-vous associé
export const commencertaches = async (req, res) => {
  const tacheId = req.params.id
  try {
    const vin  = req.body.vin;
     // trouver la tache associée à l'id de la tache reçue
    const { data: tache, error: tacheError } = await supabase
      .from("taches")
      .select("*")
      .eq("id", tacheId)
      .single();
    if (tacheError || !tache) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }
    // trouver le vehicule associé au rendezvous en cours pour ce poste 
        const { data: vehicule, error: vehiculeError } = await supabase
          .from("vehicules") 
          .select("id,client_id,marque,modele,annee,plaque,vin")
          .or(`plaque.eq.${vin},vin.eq.${vin}`)
          .single()
        log.info(" Véhicule trouvé en DB :", vehicule)
        if (vehiculeError || !vehicule) {
          return res.status(404).json({ message: "Véhicule non trouvé" });

        }
        //trouver le client associé au vehicule pour envoyer la notification
        const { data: client, error: clientError } = await supabase
          .from("utilisateurs")
          .select("user_id,nom,prenom,telephone,email")
          .eq("user_id", vehicule.client_id)
          .single()
        if (clientError || !client) {
          log.info(" Client non trouvé en DB:")
        }
      // trouver le rendez-vous associé au vehicule 
      const { data: rendezvous, error: rendezvousError } = await supabase
          .from("rendez_vous")
          .select("id,vehicule_id,statut")
          //.eq("poste_id", capteur.poste_id)
          .eq("statut", "planifie")
          .eq("vehicule_id", vehicule.id)
        .single()

        if (rendezvousError || !rendezvous) {
         return res.status(404).json({ message: "Rendez-vous non trouvé" });

        }
        
        await supabase
          .from("rendez_vous")
          .update({
            statut: "en_cours",
            heure_debut: new Date().toTimeString().split(' ')[0]

          })
          .eq("id", rendezvous.id)
        log.info(" Rendez-vous mis à jour en 'en_cours' :", rendezvous.id)
        //notifier le client que sa tache a commencé
      
        await debutreparation(client.email, vehicule.plaque) // Appeler la fonction de logique métier directement
          log.info(" Notification de début de réparation envoyée au client :", client.email)
          // mettre à jour la tache en "en_cours"
        await supabase
          .from("taches")
          .update({statut: "en_cours", heure_debut: new Date().toISOString()})
          .eq("rendezvous_id", rendezvous.id)
 
return res.status(200).json({
  message: "Tâche commencée et rendez-vous mis en cours",

});


}catch (err) {
    console.log("ERREUR SERVEUR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  };
}





//////terminer rendez-vous et tache

export const terminertaches = async (req, res) => {
  const id = req.params.id
  try {
    const  commentaires  = req.body.commentaires;

    // 1) Vérifier que la tache existe
    const { data: tache, error } = await supabase
      .from("taches")
      .select("id, statut")
      .eq("id", id)
      .single();
     
    if (error || !tache) {
      return res.status(404).json({ message: "Tâche non trouvée" });
    }

    // 2) Vérifier que le statut permet la transition
    if (tache.statut == "attribue") {
      return res.status(400).json({ message: "Cette tâche ne peut pas être terminée, elle n'est pas en cours" });
    }else 
      if (tache.statut == "termine") {
      return res.status(400).json({ message: "Cette tâche est déjà terminée" });
    }
 
    // 3) Mettre à jour le statut
    const { error: updateError } = await supabase
      .from("taches")
      .update({ statut: "termine", heure_fin: new Date().toISOString() })

      .eq("id", id);

    if (updateError) {
      return res.status(500).json({ message: "Erreur lors de la mise à jour du statut de la tâche" });
    }

//trouver id du rendez-vous lié à la tâche pour terminer le rendez-vous
console.log(".....////////////////////////////...ID reçu :", id);
    const { data: tacheData, error: tacheError } = await supabase
      .from("taches")
      .select("rendezvous_id,id")
      .eq("id", id) 
      .single();
    if (tacheError || !tacheData) {
      return res.status(404).json({ message: "Cette tâche n'existe pas" });
    }



/*
   // 1) Vérifier que le rendez-vous existe 
    const { data: rdv, error2 } = await supabase
      .from("rendez_vous")
      .select("id, statut,vehicule_id")
      .eq("id", tacheData.rendezvous_id)
      .single();

    if (error2 || !rdv) {
      return { success: false, code: 404, message: "Rendez-vous n'existe pas" };
     }

    // 2) Vérifier que le statut permet la transition
    if (rdv.statut == "en_cours") {
          return { success: false, code: 400, message: "Ce rendez-vous ne peut pas être terminé" };
    }else 
      if (rdv.statut == "termine") {      return { success: false, code: 400, message: "Ce rendez-vous est déjà terminé" };
     }
*/

// 3) Mettre à jour le statut
    const { error: updateError1 } = await supabase
      .from("rendez_vous")
      .update({ statut: "termine", commentaires: commentaires, heure_fin: new Date().toTimeString().split(' ')[0] })

      .eq("id", tacheData.rendezvous_id); 

    if (updateError1) {  return res.status(500).json({ message: "Erreur lors de la mise à jour du statut du rendez-vous" });
     }


        //terminerRendezVous(tacheData.rendezvous_id,commentaires) TERMINER -TACHE 
await terminerRendezVous(tacheData.rendezvous_id) // Appeler la fonction de logique métier directement
  //console.log(" Rendez-vous associé à la tâche terminé :", commentaires)
return res.status(200).json({
  message: "Tâche terminée et rendez-vous traité"
})

} catch (err) {
    console.log("ERREUR SERVEUR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
}