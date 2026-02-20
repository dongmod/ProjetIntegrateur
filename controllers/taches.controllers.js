import e from 'express'
import supabase from '../config/supabaseClient.js'

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
