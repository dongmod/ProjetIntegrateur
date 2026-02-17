import supabase from '../config/supabaseClient.js'
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
  const { nom, prenom, email, mot_de_passe, role } = req.body
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
