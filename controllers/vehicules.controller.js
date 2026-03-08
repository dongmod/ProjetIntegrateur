import supabase from '../config/supabaseClient.js'
import { io } from "../server.js";
export const createVehicule = async (req, res) => {
  const clientId = req.user.user_id
  console.log("ID utilisateur :", req.user)
  const { marque, modele, annee, plaque,kilometrage,vin,immatriculation,couleur } = req.body

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
          plaque,
          kilometrage,
          vin,
          immatriculation,
          couleur
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
  const clientId = req.user.user_id
  const vehiculeId = req.params.id

  const { marque, modele, annee, plaque, kilometrage,vin,immatriculation,couleur } = req.body

  const { data, error } = await supabase
    .from('vehicules')
    .update({ client_id: clientId,marque, modele, annee, plaque, kilometrage,vin,immatriculation,couleur }) 
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




export const getHistoriqueVehicule = async (req, res) => {
  const vehiculeId = req.params.id

  try {
    const { data, error } = await supabase
      .from("rendez_vous")
      .select(`
        id,
        date_rendezvous,
        type_service,
        commentaires,
        taches (
          titre,
          description,
          heure_debut,
          heure_fin
        )
      `)
      .eq("vehicule_id", vehiculeId)
      .eq("statut", "termine")
      .order("date_rendezvous", { ascending: false })

    if (error) return res.status(400).json(error)

    res.json(data)

  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" })
  }
}