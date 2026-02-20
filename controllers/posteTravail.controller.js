import supabase from '../config/supabaseClient.js'

export const createPosteTravail = async (req, res) => {
  const clientId = req.user.id
  const { nom, type_service, statut } = req.body

  // Validation simple
  if (!nom || !type_service || !statut) {
    return res.status(400).json({
      message: "Nom, type de service et statut sont obligatoires"
    })
  }

  try {





    const { data, error } = await supabase
      .from('postes_travail')
      .insert([
        {
         garage_id: req.user.garage_id,
          nom,
          type_service,
          statut
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
      message: "Poste de travail créé avec succès",
      poste_travail: data[0]
    })

  } catch (err) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    })
  }
}

export const getPostes = async (req, res) => {
  const { data, error } = await supabase
    .from('postes_travail')
    .select('*')

  if (error) return res.status(400).json(error)

  res.json(data)
}


export const updatePoste = async (req, res) => {
  const posteId = req.params.id
  const { nom, type_service, statut } = req.body

  const { data, error } = await supabase
    .from('postes_travail')
    .update({ nom, type_service, statut })
    .eq('id', posteId)
    .select()

  if (error) return res.status(400).json(error)

  res.json(data[0])
}



export const deletePoste = async (req, res) => {
  const posteId = req.params.id

  const { error } = await supabase
    .from('postes_travail')
    .delete()
    .eq('id', posteId)

  if (error) return res.status(400).json(error)

  res.json({ message: "Poste supprimé" })
}
