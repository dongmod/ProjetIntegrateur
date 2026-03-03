import supabase from '../config/supabaseClient.js'
import { io } from "../server.js";
export const createcapteurs = async (req, res) => {
  const { identifiant_materiel, poste_id, type } = req.body

  // Validation simple
  if (!identifiant_materiel || !poste_id || !type) {
    return res.status(400).json({
      message: "Identifiant materiel, poste_id et type sont obligatoires"
    })
  }

  try {


    const { data, error } = await supabase
      .from('capteurs')
      .insert([
        {
        
          identifiant_materiel,
          poste_id,
          type
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
      message: "Capteur créé avec succès",
      capteur: data[0]
    })

  } catch (err) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    })
  }
}

export const getcapteurs = async (req, res) => {
  const { data, error } = await supabase
    .from('capteurs')
    .select('*')

  if (error) return res.status(400).json(error)

  res.json(data)
}


export const updatecapteurs = async (req, res) => {
  const capteurId = req.params.id
  const { nom, type_service, statut } = req.body

  const { data, error } = await supabase
    .from('capteurs')
    .update({ nom, type_service, statut })
    .eq('id', capteurId)
    .select()

  if (error) return res.status(400).json(error)

  res.json(data[0])
}



export const deletecapteurs = async (req, res) => {
  const capteurId = req.params.id

  const { error } = await supabase
    .from('capteurs')
    .delete()
    .eq('id', capteurId)

  if (error) return res.status(400).json(error)

  res.json({ message: "Capteur supprimé" })
}
