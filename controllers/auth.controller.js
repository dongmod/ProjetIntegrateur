import supabase from '../config/supabaseClient.js'
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { sendVerificationEmail } from '../utils/email.js';
import { io } from "../server.js";
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


  const hashedmot_de_passe = await bcrypt.hash(mot_de_passe, 10);
//faire un token de verification du client
const verificationToken = jwt.sign(
  { email },
  process.env.JWT_SECRET,
  { expiresIn: "10m" }
)

//insertion
  const { data, error } = await supabase
    .from('utilisateurs')
    .insert([
      { nom, prenom, email, mot_de_passe: hashedmot_de_passe, role }
    ])
    .select()

  if (error) return res.status(400).json(error)
//envoyer le mail de verification
  await sendVerificationEmail(email, verificationToken)

  res.json({ message: "Utilisateur créé, email envoyé pour vérification", data }) 
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
if (!data.verifie) {
  return res.status(403).json({
    message: "Veuillez confirmer votre email"
  })
}

  const valid = await bcrypt.compare(mot_de_passe, data.mot_de_passe)

  if (!valid) {
    return res.status(401).json({ message: 'Mot de passe incorrect' })
  }

  const token = jwt.sign(
    { user_id: data.user_id, role: data.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
    
  )
console.log("TOKEN ENVOYÉ AU CLIENT =", token)
  res.json({ token })
}
//get user connecté
export const userconnected =  async (req, res) => {
  try {
    const userId = req.user.user_id; // ← vient du token
     console.log("USERCONNECTED → userId =", userId);

    if (!userId) {
      return res.status(400).json({ message: "Invalid token payload" });
    }
 
    const { data, error } = await supabase
      .from("utilisateurs")
      .select("*")
      .eq("user_id", userId)
      .single();
    console.log("SUPABASE DATA =", data);

    if (error) {
      return res.status(400).json({ message: error.message });
    }
 
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};


//delete
export const deleteUser = async (req, res) => {
  const userId = req.params.id

  const { error } = await supabase
    .from('utilisateurs')
    .delete()
    .eq('user_id', userId)

  if (error) return res.status(400).json(error)

  res.json({ message: "Utilisateur supprimé" })
}






///update
export const updateUser = async (req, res) => {
  const userId = req.params.id
  const { nom, prenom, email, mot_de_passe, role,garage_id,telephone,preference } = req.body

  const { data, error } = await supabase
    .from('utilisateurs')
    .update({ nom, prenom, email, mot_de_passe, role, garage_id, telephone, preference })
    .eq('user_id', userId)
    .select()

  if (error) return res.status(400).json(error)

  res.json(data[0])
}
//modification du profil de l'utilisateur connecté
export const updateProfil = async (req, res) => {
  const Profil = req.params.id
  const { nom, prenom, email,telephone,preference,garage_id } = req.body

  const { data, error } = await supabase
    .from('utilisateurs')
    .update({ nom, prenom, email, telephone, preference, garage_id })
    .eq('user_id', Profil)
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
    .eq('user_id', userId)

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
    .eq('user_id', userId)
    .single()

  if (userData && await bcrypt.compare(confirmation_mot_de_passe, userData.mot_de_passe)) {
    return res.status(400).json({ message: "Le nouveau mot de passe doit être différent de l'ancien" })
  }
  const hashedmot_de_passe = await bcrypt.hash(confirmation_mot_de_passe, 10);
  const { data, error } = await supabase
    .from('utilisateurs')
    .update({ mot_de_passe: hashedmot_de_passe })
    .eq('user_id', userId)
    .select()

  if (error) return res.status(400).json(error)

  res.json(data[0])
}

// ADD ME POUR OBTENIR LES INFOS DE L'UTILISATEUR LOGGUÉ.  
export const me = async (req, res) => {
  try {
     console.log("ME → req.user =", req.user) // vérifier que le middleware auth fonctionne et que req.user est bien défini
    const userId = req.user?.user_id;
     console.log("ME → userId extrait du token =", userId) // vérifier que le user_id est bien extrait du token
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload (missing id)" });
    }
 
 
 
    const { data, error } = await supabase
      .from("utilisateurs")
      .select("user_id, nom, prenom, email, role")
      .eq("user_id", userId)          // 👈 CAMBIAR si tu token usa user_id
      .single();
     console.log("ME → supabase data =", data) //  vérifier la réponse de Supabase
    console.log("ME → supabase error =", error) //  vérifier les erreurs de Supabase
 
    if (error || !data) {
      return res.status(404).json({ message: "Profil introuvable" });
    }
 
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};