import supabase from '../config/supabaseClient.js'

export const createVehicule = async (req, res) => {
  const clientId = req.user.id
  
console.log("ID utilisateur :", req.user)
  const { marque, modele, annee, plaque } = req.body

  // Validation simple
  if (!marque || !modele || !plaque) {
    return res.status(400).json({
      message: "Marque, modèle et plaque sont obligatoires"
    })
  }

console.log("ID utilisateur :", req.user)
  try {
    const { data, error } = await supabase
      .from('vehicules')
      .insert([
        {
          client_id: clientId,
          marque,
          modele,
          annee,
          plaque
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
      message: "Véhicule créé avec succès",
      vehicule: data[0]
    })

  } catch (err) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    })
  }
}
export const getMesVehicules = async (req, res) => {
  const clientId1 = req.user.id
console.log("ID utilisateur :", req.user)
  const { data, error } = await supabase
    .from('vehicules')
    .select('*')
    .eq('client_id', clientId1)

  if (error) return res.status(400).json(error)

  res.json(data)
}

//get by id user


export const getVehiculeall = async (req, res) => {
 

  const { data, error } = await supabase
    .from('vehicules')
    .select('*')

  if (error) return res.status(400).json(error)

  res.json(data)
}





export const updateVehicule = async (req, res) => {
  const clientId = req.user.id
  const vehiculeId = req.params.id

  const { marque, modele, annee, plaque } = req.body

  const { data, error } = await supabase
    .from('vehicules')
    .update({ marque, modele, annee, plaque })
    .eq('id', vehiculeId)
    .eq('client_id', clientId)
    .select()

  if (error) return res.status(400).json(error)

  res.json(data[0])
}
export const deleteVehicule = async (req, res) => {
  const clientId = req.user.id
  const vehiculeId = req.params.id

  const { error } = await supabase
    .from('vehicules')
    .delete()
    .eq('id', vehiculeId)
    .eq('client_id', clientId)

  if (error) return res.status(400).json(error)

  res.json({ message: "Véhicule supprimé" })
}
