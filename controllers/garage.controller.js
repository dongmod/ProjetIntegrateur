import supabase from '../config/supabaseClient.js'

export const createGarage = async (req, res) => {
  const { nom, adresse, telephone, email } = req.body

  // Validation simple
  if (!nom || !adresse || !telephone || !email) {
    return res.status(400).json({
      message: "Nom, adresse, téléphone et email sont obligatoires"
    })
  }

  try {
    const { data, error } = await supabase
      .from('garages')
      .insert([
        {
          nom,
          adresse,
          telephone,
          email
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
      message: "Garage créé avec succès",
      garage: data[0]
    })

  } catch (err) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    })
  }
}
export const getGarages = async (req, res) => {
  const { data, error } = await supabase
    .from('garages')
    .select('*')

  if (error) return res.status(400).json(error)

  res.json(data)
}
export const updateGarage = async (req, res) => {
  const garageId = req.params.id
  const { nom, adresse, telephone, email } = req.body

  const { data, error } = await supabase
    .from('garages')
    .update({ nom, adresse, telephone, email })
    .eq('id', garageId)
    .select()

  if (error) return res.status(400).json(error)

  res.json(data[0])
}
export const deleteGarage = async (req, res) => {
  const garageId = req.params.id

  const { error } = await supabase
    .from('garages')
    .delete()
    .eq('id', garageId)

  if (error) return res.status(400).json(error)

  res.json({ message: "Garage supprimé" })
}
