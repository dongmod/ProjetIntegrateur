import { types } from 'mime-types'
import supabase from '../config/supabaseClient.js'
import { io } from "../server.js";
import { schema } from '../Zod/validationNotifications.js'
export const createNotifications = async (req, res) => {
  const clientId = req.user.id
  const { message,type } = req.body
    

// 1 Validation Zod
    const result = schema.safeParse({
      message,
      type
      
    });

if (!result.success) {
  const erreur =
    result.error?.issues?.[0]?.message ||
    "Merci de vérifier vos informations.";

  return res.status(400).json({ message: erreur });
}





  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          utilisateur_id: clientId,
          message,
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
      message: "Notification créée avec succès",
      notification: data[0]
    })

  } catch (err) {
    return res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    })
  }
}
   
export const getNotifications = async (req, res) => {
  const clientId = req.user.id

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('utilisateur_id', clientId)

  if (error) return res.status(400).json(error)

  res.json(data)
}