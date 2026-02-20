import supabase from '../config/supabaseClient.js'

export const createservices = async (req, res) => {
  const { nom, duree } = req.body

  // Validation simple
  if (!nom || !duree) {
    return res.status(400).json({
      message: "Nom et durée sont obligatoires"
    })
  }

  try {

    const { data, error } = await supabase
      .from('services')
      .insert([
        {
  
          nom,
          duree
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
      message: "services créé avec succès",
      service: data[0]
    })

  } catch (err) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    })
  }
}
