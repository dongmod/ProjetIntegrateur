import e from 'express'
import supabase from '../config/supabaseClient.js'
import { io } from "../server.js";
import { terminerRendezVous } from './rendezvous.controller.js'
export const createTaches = async (req, res) => {
  const { rendezvous_id,employe_id,poste_id,titre, description, statut,heure_debut,heure_fin } = req.body

  // Validation simple
  if (!titre || !description || !statut|| !heure_debut || !heure_fin) {
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
            heure_fin
        }
      ])
      .select()

    if (error) {
      return res.status(400).json({
        message: "Erreur lors de la création",
        error
      })
    }

    return res.status(201).json({
      message: "taches créé avec succès",
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
  const userId = req.user.id

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

  if (error) return res.status(400).json(error)

  res.json(data)
}

export const updateTache = async (req, res) => {
  const tacheId = req.params.id
  const { statut, heure_debut, heure_fin } = req.body

  const { data, error } = await supabase
    .from('taches')
    .update({ statut, heure_debut, heure_fin })
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






// Marquer une tâche comme terminée





//////terminer rendez-vous

export const terminertaches = async (req, res) => {
  try {
    const { id,commentaires } = req.body;

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













        //terminerRendezVous(tacheData.rendezvous_id,commentaires)
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