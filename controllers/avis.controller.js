import supabase from '../config/supabaseClient.js'
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { sendVerificationEmail } from '../utils/email.js';
import { io } from "../server.js";
import { schema } from "../Zod/zodcreationuser.js";
import { schema1 } from "../Zod/validationlogin.js";
import { verifyToken } from '../middleware/authMiddleware.js';
import { roleFiltre } from '../middleware/filtreroleMiddleware.js';


export const createavis = async (req, res) => {
  const {
    garage_id,
    utilisateur_id,
    note,
    qualite,
    prix,
    accueil,
    details,
    commentaire,
    photos
  } = req.body

  const { data, error } = await supabase
    .from("avis_garage")
    .insert([{
      garage_id,
      utilisateur_id,
      note,
      qualite,
      prix,
      accueil,
      details,
      commentaire,
      photos
    }])
    .select()

  if (error) return res.status(400).json(error)

  res.json(data[0])
}

export const getavis = async (req, res) => {
  const garageId = req.params.id

  const { data, error } = await supabase
    .from("avis_garage")
    .select(`
      *,
      utilisateurs(nom, prenom)
    `)
    .eq("garage_id", garageId)
    .order("created_at", { ascending: false })

  if (error) return res.status(400).json(error)

  res.json(data)
}


export const modifieravis = async (req, res) => {
  const id = req.params.id
console.log("ID de l'avis à modifier :", id)
  const { note, commentaire,utilisateur_id } = req.body

  const { data, error } = await supabase
    .from("avis_garage")
    .update({
      note,
      commentaire,
      utilisateur_id,
      updated_at: new Date() })
    .eq("id", id)
    .select()

      console.log("Données reçues pour la modification :", { note, commentaire, utilisateur_id })   
   
  if (error) return res.status(400).json(error)
console.log("Avis modifié :", data[0])
  res.json(data[0])
}

export const supprimeravis = async (req, res) => {
  const id = req.params.id

  const { error } = await supabase
    .from("avis_garage")
    .delete()
    .eq("id", id)

  if (error) return res.status(400).json(error)

  res.json({ message: "Avis supprimé" })
}

export const moyenneGarage = async (req, res) => {
  const garageId = req.params.garageId

  const { data } = await supabase
    .from("avis_garage")
    .select("note")
    .eq("garage_id", garageId)

  const moyenne =
    data.reduce((sum, a) => sum + a.note, 0) / data.length

  res.json({
    moyenne: moyenne || 0,
    totalAvis: data.length
  })
}