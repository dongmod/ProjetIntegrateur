import supabase from '../config/supabaseClient.js'
import { io } from "../server.js";
export const createCommentaires_taches = async (req, res) => {
  const { tache_id, employe_id, contenu,visible_client } = req.body

  // Validation simple
  if (!tache_id || !employe_id || !contenu|| !visible_client) {
    return res.status(400).json({
      message: "tache_id, employe_id, contenu et visible_client sont obligatoires"
    })
  }

  try {
    const { data, error } = await supabase
      .from('commentaires_tache')
      .insert([
        {
          tache_id,
          employe_id,
          contenu,
          visible_client
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
      message: "commentaires créé avec succès",
      commentaires: data[0]
    })

  } catch (err) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    })
  }
}
        