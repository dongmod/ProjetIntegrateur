import supabase from '../config/supabaseClient.js'
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { schema } from "../Zod/zodcreationuser.js";
import { schema1 } from "../Zod/validationlogin.js";
import { verifyToken } from '../middleware/authMiddleware.js';
import { roleFiltre } from '../middleware/filtreroleMiddleware.js';
export const register = async (req, res) => {
  const { nom, prenom, email, mot_de_passe, role,confirmation_mot_de_passe } = req.body

    // 1 Validation Zod
    const result = schema.safeParse({
      email,
      mot_de_passe,
      confirmation_mot_de_passe
      
    });

if (!result.success) {
  const erreur =
    result.error?.issues?.[0]?.message ||
    "Merci de vérifier vos informations.";

  return res.status(400).json({ message: erreur });
}


  console.log("BODY:", req.body);
  console.log("mot_de_passe:", req.body.mot_de_passe);
  const hashedmot_de_passe = await bcrypt.hash(mot_de_passe, 10);

  const { data, error } = await supabase
    .from('utilisateurs')
    .insert([
      { nom, prenom, email, mot_de_passe: hashedmot_de_passe, role }
    ])
    .select()

  if (error) return res.status(400).json(error)

  res.json(data)
}

export const login = async (req, res) => {
  const { email, mot_de_passe } = req.body

    // 1 Validation Zod
    const result = schema1.safeParse({
      email,
      mot_de_passe,
      
    });

if (!result.success) {
  const erreur =
    result.error?.issues?.[0]?.message ||
    "Merci de vérifier vos informations.";
  return res.status(400).json({ message: erreur });
}





  const { data, error } = await supabase
    .from('utilisateurs')
    .select('*')
    .eq('email', email)
    .single()
console.log("LOGIN BODY:", req.body);
  if (error || !data) {
    return res.status(401).json({ message: 'Utilisateur non trouvé' })
  }

  const valid = await bcrypt.compare(mot_de_passe, data.mot_de_passe)

  if (!valid) {
    return res.status(401).json({ message: 'Mot de passe incorrect' })
  }

  const token = jwt.sign(
    { id: data.id, role: data.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )

  res.json({ token })
}



//delete
export const deleteUser = async (req, res) => {
  const userId = req.params.id

  const { error } = await supabase
    .from('utilisateurs')
    .delete()
    .eq('id', userId)

  if (error) return res.status(400).json(error)

  res.json({ message: "Utilisateur supprimé" })
}






///update
export const updateUser = async (req, res) => {
  const userId = req.params.id
  const { nom, prenom, email, mot_de_passe, role } = req.body

  const { data, error } = await supabase
    .from('utilisateurs')
    .update({ nom, prenom, email, mot_de_passe, role })
    .eq('id', userId)
    .select()

  if (error) return res.status(400).json(error)

  res.json(data[0])
}



///get user
export const getUser = async (req, res) => {
  const { data, error } = await supabase
    .from('utilisateurs')
    .select('*')

  if (error) return res.status(400).json(error)

  res.json(data)
}


///get user by id
export const getUserbyId = async (req, res) => {
  const userId = req.params.id

  const { data, error } = await supabase
    .from('utilisateurs')
    .select('*')
    .eq('id', userId)

  if (error) return res.status(400).json(error)

  res.json(data)
}



///reset mot de passe
export const resetMot_de_passe = async (req, res) => {
  const userId = req.params.id
  const { mot_de_passe,confirmation_mot_de_passe } = req.body
  if(mot_de_passe !== confirmation_mot_de_passe){
    return res.status(400).json({message:"Les mots de passe ne correspondent pas"})
  }
  //const hashedmot_de_passe = await bcrypt.hash(mot_de_passe, 10);
//select du passet de passe actuel
  const { data: userData, error: userError } = await supabase
    .from('utilisateurs')
    .select('mot_de_passe')
    .eq('id', userId)
    .single()

  if (userData && await bcrypt.compare(confirmation_mot_de_passe, userData.mot_de_passe)) {
    return res.status(400).json({ message: "Le nouveau mot de passe doit être différent de l'ancien" })
  }
  const hashedmot_de_passe = await bcrypt.hash(confirmation_mot_de_passe, 10);
  const { data, error } = await supabase
    .from('utilisateurs')
    .update({ mot_de_passe: hashedmot_de_passe })
    .eq('id', userId)
    .select()

  if (error) return res.status(400).json(error)

  res.json(data[0])
}
