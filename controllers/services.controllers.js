import supabase from '../config/supabaseClient.js'
import { getIO } from "../websocket/socket.js";

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
export const getservices = async (req, res) => {
console.log("ID utilisateur :", req.user)
  const { data, error } = await supabase
    .from('services')
    .select('*')

  if (error) return res.status(400).json(error)

  res.json(data)
}



export const updateService = async (req, res) => {
  const { id } = req.params
  const { nom, duree } = req.body
 
  if (!nom || !duree) {
    return res.status(400).json({ message: "Nom et durée sont obligatoires" })
  }
 
  try {
    const { data, error } = await supabase
      .from('services')
      .update({ nom, duree })
      .eq('id', id)
      .select()
 
    if (error) return res.status(400).json({ message: "Erreur lors de la mise à jour", error })
    if (!data || data.length === 0) return res.status(404).json({ message: "Service introuvable" })
 
    return res.json({ message: "Service mis à jour", service: data[0] })
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message })
  }
}

//Noveau v. 
export const deleteService = async (req, res) => {
  const { id } = req.params
 
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)
 
    if (error) return res.status(400).json({ message: "Erreur lors de la suppression", error })
 
    return res.json({ message: "Service supprimé avec succès" })
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message })
  }
}